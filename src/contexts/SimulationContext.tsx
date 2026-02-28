import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useData } from './DataContext';
import { useToast } from './ToastContext';

export interface Truck {
  id: string;
  name: string;
  vehicle: string;
  pos: [number, number];
  status: 'Disponível' | 'Em Rota';
}

interface SimulationContextType {
  trucks: Truck[];
  isSimulating: boolean;
  toggleSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const INITIAL_TRUCKS: Truck[] = [
  { id: 'T1', name: 'Carlos S.', vehicle: 'Caminhão Leve', pos: [-23.5485, -46.6313], status: 'Em Rota' },
  { id: 'T2', name: 'Ana P.', vehicle: 'Van', pos: [-23.5600, -46.6400], status: 'Disponível' },
  { id: 'T3', name: 'João M.', vehicle: 'Caminhão Leve', pos: [-23.5400, -46.6200], status: 'Em Rota' },
  { id: 'T4', name: 'Roberto F.', vehicle: 'Carroça', pos: [-23.5550, -46.6250], status: 'Disponível' },
];

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [trucks, setTrucks] = useState<Truck[]>(INITIAL_TRUCKS);
  const [isSimulating, setIsSimulating] = useState(true);
  const { addMaterial } = useData();
  const { addToast } = useToast();

  // Truck Movement Simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTrucks(prev => prev.map(truck => {
        // Random walk towards center or random direction
        const latDiff = (Math.random() - 0.5) * 0.0005;
        const lngDiff = (Math.random() - 0.5) * 0.0005;
        return {
          ...truck,
          pos: [truck.pos[0] + latDiff, truck.pos[1] + lngDiff]
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Random Disposal Generation Simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // 30% chance to spawn a new material every 10 seconds
      if (Math.random() > 0.7) {
        const types = ['Plástico', 'Metal', 'Eletrônico', 'Papel', 'Vidro'];
        const type = types[Math.floor(Math.random() * types.length)];
        const weights = ['1kg', '5kg', '2 un', '10kg', '3kg'];
        const weight = weights[Math.floor(Math.random() * weights.length)];
        
        // Spawn near center
        const lat = -23.5505 + (Math.random() - 0.5) * 0.02;
        const lng = -46.6333 + (Math.random() - 0.5) * 0.02;

        addMaterial({
          type,
          weight,
          pos: [lat, lng],
          generatorId: 'SIMULATED_USER'
        });

        addToast(`Novo descarte de ${type} detectado na região!`, 'info');
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isSimulating, addMaterial, addToast]);

  const toggleSimulation = () => setIsSimulating(!isSimulating);

  return (
    <SimulationContext.Provider value={{ trucks, isSimulating, toggleSimulation }}>
      {children}
    </SimulationContext.Provider>
  );
}

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
