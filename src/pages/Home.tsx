import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Camera, Navigation, MapPin, Filter, Layers, Truck, CheckCircle, Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const userIcon = createCustomIcon('#2D6A4F');
const collectionPointIcon = createCustomIcon('#343A40');
const materialIcon = createCustomIcon('#FFCA28');
const acceptedIcon = createCustomIcon('#3B82F6'); // Blue for accepted

const MOCK_LOCATION: [number, number] = [-23.5505, -46.6333]; // São Paulo

const MOCK_COLLECTION_POINTS = [
  { id: 1, pos: [-23.5485, -46.6313] as [number, number], name: 'Ecoponto Central' },
  { id: 2, pos: [-23.5525, -46.6353] as [number, number], name: 'Cooperativa Verde' },
];

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function Home() {
  const { user } = useAuth();
  const { materials, acceptMaterial } = useData();
  
  // Use the role from context, fallback to 'user' if not set (though it should be set due to ProtectedRoute)
  const [viewMode, setViewMode] = useState<'user' | 'collector'>(user?.role === 'collector' ? 'collector' : 'user');
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(MOCK_LOCATION);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Não foi possível obter sua localização.");
        }
      );
    }
  };

  const handleAcceptCollection = (id: string) => {
    if (user) {
      acceptMaterial(id, user.id);
    }
  };

  const filteredMaterials = activeFilter 
    ? materials.filter(m => m.type === activeFilter)
    : materials;

  const activeCollectionsCount = materials.filter(m => m.status === 'IN_TRANSIT' && m.collectorId === user?.id).length;

  return (
    <div className="relative w-full h-full flex flex-col bg-reflow-ice dark:bg-gray-900 transition-colors">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex justify-between items-start pointer-events-none">
        {/* View Toggle (Kept for demo purposes, but defaults to user's actual role) */}
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-1 flex gap-1 pointer-events-auto border border-gray-100 dark:border-gray-700 transition-colors">
          <button
            onClick={() => setViewMode('user')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'user' 
                ? 'bg-reflow-emerald text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Cidadão
          </button>
          <button
            onClick={() => setViewMode('collector')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              viewMode === 'collector' 
                ? 'bg-reflow-anthracite dark:bg-gray-700 text-white shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            Coletor
          </button>
        </div>

        {/* Locate Button */}
        <button 
          onClick={handleLocateMe}
          className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg pointer-events-auto text-reflow-emerald dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Collector Filters */}
      {viewMode === 'collector' && (
        <div className="absolute top-20 left-4 z-[400] pointer-events-auto flex flex-col gap-2">
          {['Plástico', 'Metal', 'Eletrônico', 'Papel', 'Vidro'].map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(activeFilter === type ? null : type)}
              className={`px-3 py-2 rounded-lg shadow-md text-xs font-semibold flex items-center gap-2 transition-all ${
                activeFilter === type 
                  ? 'bg-reflow-alert text-reflow-anthracite scale-105' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Layers className="w-3 h-3" />
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 w-full h-full z-0">
        <MapContainer 
          center={userLocation} 
          zoom={15} 
          zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater center={userLocation} />

          {/* User Location Marker */}
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Você está aqui</Popup>
          </Marker>

          {/* User View: Collection Points */}
          {viewMode === 'user' && MOCK_COLLECTION_POINTS.map(point => (
            <Marker key={point.id} position={point.pos} icon={collectionPointIcon}>
              <Popup>
                <div className="font-semibold text-reflow-anthracite">{point.name}</div>
                <div className="text-xs text-gray-500 mt-1">Ponto de Coleta Oficial</div>
              </Popup>
            </Marker>
          ))}

          {/* Collector View: Available Materials */}
          {viewMode === 'collector' && filteredMaterials.map(mat => (
            <Marker key={mat.id} position={mat.pos} icon={mat.status === 'AVAILABLE' ? materialIcon : acceptedIcon}>
              <Popup>
                <div className="font-semibold text-reflow-anthracite">
                  {mat.status === 'AVAILABLE' ? 'Coleta Pendente' : 'Em Deslocamento'}
                </div>
                <div className="text-sm mt-1"><span className="font-medium">Tipo:</span> {mat.type}</div>
                <div className="text-sm"><span className="font-medium">Volume:</span> {mat.weight}</div>
                
                {mat.status === 'AVAILABLE' ? (
                  <button 
                    onClick={() => handleAcceptCollection(mat.id)}
                    className="mt-3 w-full bg-reflow-emerald text-white py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" /> Aceitar Coleta
                  </button>
                ) : (
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${mat.pos[0]},${mat.pos[1]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <MapIcon className="w-4 h-4" /> Traçar Rota
                  </a>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* User Floating Action Button */}
      {viewMode === 'user' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-auto">
          <Link 
            to="/disposal"
            className="flex items-center gap-3 bg-reflow-emerald text-white px-6 py-4 rounded-full shadow-[0_8px_30px_rgb(45,106,79,0.4)] hover:bg-emerald-700 hover:scale-105 transition-all duration-300 font-semibold text-lg"
          >
            <Camera className="w-6 h-6" />
            Descartar Agora
          </Link>
        </div>
      )}

      {/* Collector Status Bar */}
      {viewMode === 'collector' && (
        <div className="absolute bottom-4 left-4 right-4 z-[400] pointer-events-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-colors">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Status</p>
              <p className="text-reflow-anthracite dark:text-white font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {activeCollectionsCount > 0 ? 'Em Rota' : 'Aguardando chamados'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Ativas</p>
              <p className="text-reflow-emerald dark:text-emerald-400 font-bold text-lg">{activeCollectionsCount} coletas</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
