# ♻️ ReFlow: Geospatial Waste Management Ecosystem

O **ReFlow** é uma solução *end-to-end* para logística reversa que utiliza inteligência geográfica para mitigar a ineficiência na coleta de resíduos sólidos. O sistema foca em **baixa latência para consultas espaciais** e **consistência de estado** em transações de coleta.

---

## 🏗️ Arquitetura do Sistema

A aplicação segue os princípios da **Clean Architecture**, dividida em camadas para garantir o desacoplamento e a testabilidade.

### Componentes Core:

* **Backend (API REST):** Desenvolvido com **Spring Boot 3**. Utiliza **Spring Data JPA** acoplado ao **Hibernate Spatial** para persistência de tipos `Geometry`.
* **Database:** **PostgreSQL** com extensão **PostGIS**. Utilizamos índices **GIST (Generalized Search Tree)** para otimizar buscas em planos cartesianos e esferoidais.
* **Security:** Implementação de **Stateless Auth** via **Spring Security 6** e **JWT**.
* **Frontend:** SPA construída em **React 19** + **TypeScript** e **Vite**, utilizando **Zustand** para gerenciamento de estado global.

---

## 📊 Modelagem de Dados Geoespaciais

Diferente de sistemas comuns que armazenam `lat` e `lng` como `Double`, o ReFlow utiliza o tipo **Geometry(Point, 4326)**. Isso permite cálculos precisos no padrão **WGS84**.

### Entidade `WasteDeposit` (Lógica de Persistência):

```java
@Entity
public class WasteDeposit {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location; // JTS Point object

    @Enumerated(EnumType.STRING)
    private MaterialType materialType;

    // ... getters e setters
}

```

---

## 🛠️ Design Patterns Aplicados

1. **Repository Pattern:** Abstração total da camada de dados.
2. **Strategy Pattern:** Para o cálculo de `EcoPoints` baseado no tipo de material.
3. **DTO Pattern:** Isolamento das entidades da camada de apresentação usando **Java 17 Records**.
4. **Observer (Event Driven):** Disparo de notificações assíncronas via `@EventListener` assim que um novo descarte é persistido.

---

## ⚡ Performance: PostGIS vs Haversine

Implementamos a lógica de busca no banco de dados para evitar o carregamento de milhares de registros na memória da JVM.

**Query de Proximidade (Geofencing):**

```sql
SELECT * FROM waste_deposits 
WHERE ST_DWithin(
    location, 
    ST_MakePoint(:lng, :lat)::geography, 
    :distanceInMeters
) AND status = 'AVAILABLE';

```

* **Sem Índice:** $O(N)$
* **Com Índice GIST:** $O(\log N)$

---

## 🛠️ Configuração de Ambiente (Dev)

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
DB_URL=jdbc:postgresql://localhost:5432/reflow_db
DB_USER=admin
DB_PASS=reflow_pass
JWT_SECRET=sua_chave_secreta_longa_aqui

```

### 2. Infraestrutura Docker

O comando abaixo provisiona o banco já com a extensão espacial habilitada:

```bash
docker-compose up -d

```

### 3. Migrations

O projeto utiliza **Flyway** (opcional) para versionamento do banco. As tabelas são criadas automaticamente via Hibernate Dialect em modo `update` no ambiente de dev.

---

## 🔗 API Endpoints (Principais)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Registro de novos usuários (Gerador/Coletor) |
| `POST` | `/api/v1/deposits` | Registro de novo descarte com `Point` |
| `GET` | `/api/v1/deposits/nearby` | Busca geográfica filtrada por raio |
| `PATCH` | `/api/v1/collections/{id}/accept` | Transição de estado do descarte |

---

## 🧪 Testes

Para rodar a suíte de testes unitários e de integração:

```bash
mvn test

```

* **Testcontainers:** Utilizamos containers Docker reais nos testes de integração para validar as queries PostGIS.

---
