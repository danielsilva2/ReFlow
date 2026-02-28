# Documentação Técnica - ReFlow (MVP)

Este documento apresenta a especificação técnica e arquitetural do sistema **ReFlow**, estruturada para compor a documentação de um Trabalho de Conclusão de Curso (TCC) em Engenharia de Software / Ciência da Computação.

---

## 1. Introdução
O **ReFlow** é uma plataforma digital focada na otimização do fluxo de reciclagem urbana. O sistema atua como um *marketplace* de resíduos, conectando geradores (cidadãos e empresas) a coletores (catadores independentes e cooperativas) através de geolocalização em tempo real.

### 1.1. Problema
A ineficiência na coleta seletiva urbana, onde geradores não sabem onde ou como descartar resíduos específicos, e coletores gastam tempo e combustível buscando materiais sem rotas otimizadas.

### 1.2. Solução
Um aplicativo *Mobile-First* que permite o descarte em poucos cliques com captura de GPS, e um painel de logística para coletores encontrarem os resíduos mais próximos, reduzindo o tempo de ociosidade e aumentando a taxa de reciclagem da cidade.

---

## 2. Arquitetura do Sistema

A arquitetura do ReFlow é baseada no modelo Cliente-Servidor, utilizando tecnologias modernas para garantir escalabilidade, performance e processamento geoespacial.

### 2.1. Stack Tecnológico
*   **Frontend (Interface do Usuário):**
    *   **Framework:** React 19 com Vite (TypeScript).
    *   **Estilização:** Tailwind CSS v4 (Abordagem *Mobile-First* e suporte nativo a *Dark Mode*).
    *   **Mapas:** Leaflet e React-Leaflet para renderização de mapas interativos.
    *   **Gráficos:** Recharts para o Dashboard Administrativo.
    *   **Animações:** Framer Motion para transições fluidas.
*   **Backend (Regras de Negócio - API REST):**
    *   **Linguagem:** Java 17 (Uso de *Records*, *Pattern Matching* e *Enums*).
    *   **Framework:** Spring Boot 3.x (Spring Web, Spring Data JPA, Spring Security).
*   **Banco de Dados:**
    *   **SGBD:** PostgreSQL.
    *   **Extensão Espacial:** PostGIS (Para cálculos de distância e *Geofencing*).

---

## 3. Requisitos do Sistema

### 3.1. Requisitos Funcionais (RF)
*   **RF01:** O sistema deve permitir o login de usuários via integração com o portal **gov.br**.
*   **RF02:** O sistema deve permitir que o usuário defina seu perfil como "Gerador" (Cidadão/Empresa) ou "Coletor" (Catador/Cooperativa).
*   **RF03:** O Gerador deve poder registrar um descarte enviando foto, categoria do material e localização GPS automática.
*   **RF04:** O Coletor deve visualizar em um mapa os descartes disponíveis em um raio de X km.
*   **RF05:** O Coletor deve poder aceitar uma coleta, alterando o status do descarte para "Em deslocamento".
*   **RF06:** O sistema deve fornecer roteirização básica (link para Google Maps/Waze) para o Coletor chegar ao local do descarte.
*   **RF07:** O Administrador deve ter acesso a um Dashboard com métricas de volume, impacto ambiental (CO2 evitado) e rastreamento de frotas em tempo real.
*   **RF08:** O sistema deve calcular e atribuir "EcoPoints" aos geradores com base no volume e tipo de material descartado.

### 3.2. Requisitos Não Funcionais (RNF)
*   **RNF01:** A interface deve ser responsiva (*Mobile-First*) e suportar Modo Claro/Escuro (*Dark Mode*) para economia de bateria em telas OLED.
*   **RNF02:** Consultas geográficas devem ser otimizadas utilizando índices espaciais no PostGIS.
*   **RNF03:** A comunicação de novos descartes para coletores próximos deve ocorrer em tempo real (via WebSockets ou Push Notifications).

---

## 4. Modelagem de Dados (PostgreSQL + PostGIS)

O modelo de dados foi projetado para ser *geospatial-ready*, utilizando o tipo `GEOMETRY(Point, 4326)` do PostGIS.

### 4.1. Tabelas Principais

**Tabela: `users`**
Armazena todos os perfis da plataforma.
*   `id`: UUID (PK)
*   `name`: VARCHAR
*   `cpf`: VARCHAR (Unique)
*   `role`: ENUM ('GENERATOR', 'COLLECTOR', 'ADMIN')
*   `phone`: VARCHAR
*   `vehicle_type`: VARCHAR (Apenas para coletores)

**Tabela: `waste_deposits`**
Registra a intenção de descarte.
*   `id`: UUID (PK)
*   `generator_id`: UUID (FK -> users.id)
*   `material_type`: ENUM ('PLASTIC', 'METAL', 'GLASS', 'PAPER', 'ELECTRONIC')
*   `photo_url`: VARCHAR
*   `location`: GEOMETRY(Point, 4326) *(Indexado com GIST)*
*   `status`: ENUM ('AVAILABLE', 'IN_TRANSIT', 'COLLECTED', 'CANCELLED')
*   `created_at`: TIMESTAMP

**Tabela: `collections`**
Registra a transação (o *match*).
*   `id`: UUID (PK)
*   `deposit_id`: UUID (FK -> waste_deposits.id) - UNIQUE
*   `collector_id`: UUID (FK -> users.id)
*   `accepted_at`: TIMESTAMP
*   `completed_at`: TIMESTAMP (Nullable)
*   `earned_points`: INTEGER

### 4.2. Exemplo de Query Espacial (PostGIS)
Busca de descartes disponíveis em um raio de 5km do coletor:
```sql
SELECT * FROM waste_deposits 
WHERE ST_DWithin(
  location, 
  ST_MakePoint(:longitude, :latitude)::geography, 
  5000
) AND status = 'AVAILABLE';
```

---

## 5. Design de Interface e UX

O design foi concebido para transmitir sustentabilidade e eficiência.

*   **Paleta de Cores:**
    *   Verde Esmeralda (`#2D6A4F`): Cor primária, remete à ecologia.
    *   Branco Gelo (`#F8F9FA`): Fundo limpo para o modo claro.
    *   Cinza Antracite (`#343A40`): Textos e contrastes.
    *   Amarelo Alerta (`#FFCA28`): Ícones de atenção e pendências.
*   **Tipografia:** `Inter` (Sans-serif moderna, excelente legibilidade em telas pequenas).
*   **Padrões de Interação:**
    *   *Bottom Navigation Bar* no mobile para facilitar o uso com uma mão.
    *   Botão Flutuante de Ação (FAB) proeminente para o descarte.
    *   Barra de progresso de status estilo aplicativos de mobilidade (ex: Uber).

---

## 6. Regras de Negócio (Backend Java 17)

O "coração" do sistema no backend gerencia as seguintes lógicas críticas:

### 6.1. Matching Geográfico e Notificação Proativa
Quando um `WasteDeposit` é salvo, o sistema utiliza o Hibernate Spatial para mapear a coordenada. Um evento assíncrono é disparado para buscar coletores ativos (conectados via WebSocket) cujo raio de atuação intercepte o ponto do descarte, enviando um alerta *Push*.

### 6.2. Transporte de Dados Imutáveis (Records)
Uso de Java Records para DTOs, garantindo imutabilidade e código limpo na camada de controle:
```java
public record LocationDTO(double latitude, double longitude) {}
public record DepositRequestDTO(String materialType, LocationDTO location) {}
```

### 6.3. Máquina de Estados do Descarte
O ciclo de vida do resíduo é estritamente controlado via *Pattern Matching* do Java 17 para transições de estado (Enums):
`AVAILABLE` -> `IN_TRANSIT` -> `COLLECTED`.
Um descarte `IN_TRANSIT` sofre *lock* otimista no banco de dados para evitar que dois coletores aceitem a mesma demanda simultaneamente.

---

## 7. Fluxos do MVP (Implementados no Frontend)

1.  **Autenticação (Gov.br):** Tela de login que simula o SSO governamental, garantindo a identidade do usuário. Redireciona para o *Setup* de perfil no primeiro acesso.
2.  **Fluxo do Cidadão (Descarte):**
    *   Acesso à câmera via API HTML5.
    *   Seleção visual da categoria.
    *   Captura de GPS via `navigator.geolocation`.
    *   Acompanhamento do status (Solicitado -> A Caminho -> Realizado).
3.  **Fluxo do Coletor (Marketplace):**
    *   Mapa interativo com *pins* de materiais disponíveis.
    *   Filtros rápidos por tipo de material.
    *   Ação de "Aceitar Coleta" e redirecionamento para traçar rota.
4.  **Dashboard Administrativo:**
    *   **Visão Geral:** KPIs de volume, usuários e gráficos de barras/áreas.
    *   **Gestão de Frotas:** Mapa em tempo real rastreando a posição dos coletores.
    *   **Impacto (Cidadão):** Gamificação mostrando CO2 evitado e EcoPoints.
    *   **Categorias:** CRUD de tipos de materiais e suas respectivas pontuações.

---

## 8. Considerações Finais e Trabalhos Futuros
O MVP do ReFlow demonstra a viabilidade técnica de um sistema de logística reversa sob demanda. Como próximos passos para evolução do projeto após o TCC, sugere-se:
*   Integração real com a API do Gov.br via OAuth2.
*   Implementação de um algoritmo de roteirização (Caixeiro Viajante) para coletores que aceitam múltiplas coletas simultâneas.
*   Integração com gateways de pagamento para monetização da venda de resíduos para grandes indústrias.
