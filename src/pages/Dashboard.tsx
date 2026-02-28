import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Download, TrendingUp, Users, Truck, Leaf, Activity, FileText, Plus, Trash2, Edit2, Recycle } from 'lucide-react';
import L from 'leaflet';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const MOCK_VOLUME_DATA = [
  { name: 'Centro', volume: 4000 },
  { name: 'Zona Sul', volume: 3000 },
  { name: 'Zona Leste', volume: 2000 },
  { name: 'Zona Norte', volume: 2780 },
  { name: 'Zona Oeste', volume: 1890 },
];

const MOCK_CARBON_DATA = [
  { month: 'Jan', saved: 120 },
  { month: 'Fev', saved: 150 },
  { month: 'Mar', saved: 180 },
  { month: 'Abr', saved: 220 },
  { month: 'Mai', saved: 280 },
  { month: 'Jun', saved: 310 },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'Plástico', pointsPerKg: 10, active: true },
  { id: 2, name: 'Metal', pointsPerKg: 25, active: true },
  { id: 3, name: 'Vidro', pointsPerKg: 5, active: true },
  { id: 4, name: 'Papel', pointsPerKg: 8, active: true },
  { id: 5, name: 'Eletrônico', pointsPerKg: 50, active: true },
];

const createCollectorIcon = () => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #FFCA28; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #343A40; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"><div style="width: 8px; height: 8px; background-color: #343A40; border-radius: 50%;"></div></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const collectorIcon = createCollectorIcon();

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'impact' | 'categories'>('overview');
  const { materials } = useData();
  const { user } = useAuth();

  const activeCollections = materials.filter(m => m.status === 'IN_TRANSIT').length;
  const totalVolume = materials.length * 2.5; // Mock calculation based on items

  // Format materials for the table
  const tableData = materials.map(m => ({
    id: m.id.substring(0, 8),
    address: `Lat: ${m.pos[0].toFixed(3)}, Lng: ${m.pos[1].toFixed(3)}`,
    type: m.type,
    status: m.status === 'AVAILABLE' ? 'Aguardando' : m.status === 'IN_TRANSIT' ? 'Em andamento' : 'Concluído',
    collector: m.collectorId ? 'Coletor Atribuído' : '-',
    time: new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  })).reverse(); // Newest first

  return (
    <div className="flex flex-col h-full bg-reflow-ice dark:bg-gray-900 overflow-y-auto transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-reflow-anthracite dark:text-white">Painel de Controle</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Visão geral da operação e impacto ambiental</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Exportando relatório PDF...")}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-reflow-anthracite dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Exportar PDF
          </button>
          <button 
            onClick={() => alert("Exportando dados Excel...")}
            className="flex items-center gap-2 px-4 py-2 bg-reflow-emerald text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold shadow-sm"
          >
            <Download className="w-4 h-4" />
            Relatório Completo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-6 flex gap-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto hide-scrollbar">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'overview' 
              ? 'border-reflow-emerald text-reflow-emerald dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-reflow-anthracite dark:hover:text-gray-200'
          }`}
        >
          Visão Geral
        </button>
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'fleet' 
              ? 'border-reflow-emerald text-reflow-emerald dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-reflow-anthracite dark:hover:text-gray-200'
          }`}
        >
          Gestão de Frotas
        </button>
        <button 
          onClick={() => setActiveTab('impact')}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'impact' 
              ? 'border-reflow-emerald text-reflow-emerald dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-reflow-anthracite dark:hover:text-gray-200'
          }`}
        >
          Meu Impacto (Cidadão)
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`pb-3 px-2 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
            activeTab === 'categories' 
              ? 'border-reflow-emerald text-reflow-emerald dark:text-emerald-400' 
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-reflow-anthracite dark:hover:text-gray-200'
          }`}
        >
          Categorias (Admin)
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-reflow-emerald dark:text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+12%</span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Volume Total (Mês)</h3>
                <p className="text-2xl font-bold text-reflow-anthracite dark:text-white mt-1">{totalVolume.toFixed(1)} Ton</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+5%</span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Usuários Ativos</h3>
                <p className="text-2xl font-bold text-reflow-anthracite dark:text-white mt-1">2,450</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-600 dark:text-yellow-500">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">Estável</span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Coletores em Rota</h3>
                <p className="text-2xl font-bold text-reflow-anthracite dark:text-white mt-1">{activeCollections}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col relative overflow-hidden transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full opacity-50 pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-reflow-emerald text-white flex items-center justify-center shadow-md">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+24%</span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium relative z-10">Índice de Carbono Salvo</h3>
                <p className="text-2xl font-bold text-reflow-emerald dark:text-emerald-400 mt-1 relative z-10">1,270 kg</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-bold text-reflow-anthracite dark:text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  Volume por Bairro (kg)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_VOLUME_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--color-reflow-ice)' }}
                      />
                      <Bar dataKey="volume" fill="#2D6A4F" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area Chart */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                <h3 className="text-lg font-bold text-reflow-anthracite dark:text-white mb-6 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  Evolução do Impacto (CO₂ Evitado)
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CARBON_DATA}>
                      <defs>
                        <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--color-reflow-ice)' }}
                      />
                      <Area type="monotone" dataKey="saved" stroke="#2D6A4F" strokeWidth={3} fillOpacity={1} fill="url(#colorSaved)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-bold text-reflow-anthracite dark:text-white">Coletas Recentes</h3>
                <button className="text-sm font-semibold text-reflow-emerald dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">Ver todas</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                      <th className="p-4 font-semibold">ID</th>
                      <th className="p-4 font-semibold">Endereço</th>
                      <th className="p-4 font-semibold">Material</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Coletor</th>
                      <th className="p-4 font-semibold">Tempo</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    {tableData.map((col) => (
                      <tr key={col.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="p-4 font-mono font-medium text-gray-600 dark:text-gray-400">{col.id}</td>
                        <td className="p-4 text-reflow-anthracite dark:text-gray-200 font-medium">{col.address}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                            {col.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            col.status === 'Em andamento' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                            col.status === 'Aguardando' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                            'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                          }`}>
                            {col.status === 'Em andamento' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />}
                            {col.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{col.collector}</td>
                        <td className="p-4 text-gray-500 dark:text-gray-500">{col.time}</td>
                      </tr>
                    ))}
                    {tableData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">Nenhuma coleta registrada ainda.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-200px)] transition-colors">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-reflow-anthracite dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-reflow-alert" />
                Rastreamento em Tempo Real
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><span className="w-3 h-3 rounded-full bg-reflow-alert border-2 border-reflow-anthracite dark:border-gray-800"></span> Ativos (42)</span>
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300"><span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-gray-400 dark:border-gray-500"></span> Inativos (8)</span>
              </div>
            </div>
            <div className="flex-1 relative">
              <MapContainer 
                center={[-23.5505, -46.6333]} 
                zoom={13} 
                zoomControl={true}
                className="w-full h-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                
                {/* Mock Collectors */}
                <Marker position={[-23.5485, -46.6313]} icon={collectorIcon}>
                  <Popup>
                    <div className="font-bold text-gray-900">Carlos S.</div>
                    <div className="text-xs text-gray-500">Veículo: Caminhão Leve</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">Em Rota (COL-001)</div>
                  </Popup>
                </Marker>
                <Marker position={[-23.5600, -46.6400]} icon={collectorIcon}>
                  <Popup>
                    <div className="font-bold text-gray-900">Ana P.</div>
                    <div className="text-xs text-gray-500">Veículo: Van</div>
                    <div className="text-xs text-gray-500 font-bold mt-1">Disponível</div>
                  </Popup>
                </Marker>
                <Marker position={[-23.5400, -46.6200]} icon={collectorIcon}>
                  <Popup>
                    <div className="font-bold text-gray-900">João M.</div>
                    <div className="text-xs text-gray-500">Veículo: Caminhão Leve</div>
                    <div className="text-xs text-emerald-600 font-bold mt-1">Em Rota (COL-004)</div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-reflow-emerald to-emerald-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
              <Leaf className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-10 pointer-events-none" />
              <h2 className="text-3xl font-bold mb-2 relative z-10">Seu Impacto Ambiental</h2>
              <p className="text-emerald-100 mb-8 relative z-10">Veja como suas ações estão ajudando o planeta.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <p className="text-emerald-100 text-sm font-medium mb-1">Peso Desviado</p>
                  <p className="text-4xl font-bold">142 kg</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <p className="text-emerald-100 text-sm font-medium mb-1">CO₂ Evitado</p>
                  <p className="text-4xl font-bold">35 kg</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <p className="text-emerald-100 text-sm font-medium mb-1">EcoPoints</p>
                  <p className="text-4xl font-bold text-reflow-alert">1,250</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-lg font-bold text-reflow-anthracite dark:text-white mb-4">Histórico de Descartes</h3>
              <div className="space-y-4">
                {materials.filter(m => m.generatorId === user?.id).map((m, i) => (
                  <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-reflow-emerald dark:text-emerald-400">
                        <Recycle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-reflow-anthracite dark:text-white">{m.type}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status: {m.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-reflow-anthracite dark:text-white">{m.weight}</p>
                      <p className="text-sm text-reflow-emerald dark:text-emerald-400 font-medium">+10 pts</p>
                    </div>
                  </div>
                ))}
                {materials.filter(m => m.generatorId === user?.id).length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Você ainda não realizou nenhum descarte.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-reflow-anthracite dark:text-white">Gestão de Categorias</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure os materiais aceitos e suas recompensas.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-reflow-emerald text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold shadow-sm">
                <Plus className="w-4 h-4" />
                Nova Categoria
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Material</th>
                    <th className="p-4 font-semibold">EcoPoints (por Kg)</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                  {MOCK_CATEGORIES.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="p-4 font-bold text-reflow-anthracite dark:text-gray-200">{cat.name}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400 font-mono">{cat.pointsPerKg} pts</td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          Ativo
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
