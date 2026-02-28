import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Material {
  id: string;
  type: string;
  weight: string;
  pos: [number, number];
  status: 'AVAILABLE' | 'IN_TRANSIT' | 'COLLECTED';
  generatorId?: string;
  collectorId?: string;
  createdAt: string;
}

interface DataContextType {
  materials: Material[];
  addMaterial: (material: Omit<Material, 'id' | 'status' | 'createdAt'>) => void;
  acceptMaterial: (id: string, collectorId: string) => void;
  completeMaterial: (id: string) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_MOCK_MATERIALS: Material[] = [
  { id: '1', pos: [-23.5495, -46.6323], type: 'Plástico', weight: '2kg', status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: '2', pos: [-23.5515, -46.6343], type: 'Eletrônico', weight: '1 un', status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: '3', pos: [-23.5500, -46.6360], type: 'Metal', weight: '5kg', status: 'AVAILABLE', createdAt: new Date().toISOString() },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('@reflow:materials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_MOCK_MATERIALS;
      }
    }
    return INITIAL_MOCK_MATERIALS;
  });

  useEffect(() => {
    localStorage.setItem('@reflow:materials', JSON.stringify(materials));
  }, [materials]);

  const addMaterial = (material: Omit<Material, 'id' | 'status' | 'createdAt'>) => {
    const newMaterial: Material = {
      ...material,
      id: Math.random().toString(36).substring(2, 9),
      status: 'AVAILABLE',
      createdAt: new Date().toISOString(),
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const acceptMaterial = (id: string, collectorId: string) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'IN_TRANSIT', collectorId } : m
    ));
  };

  const completeMaterial = (id: string) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, status: 'COLLECTED' } : m
    ));
  };

  const clearData = () => {
    setMaterials(INITIAL_MOCK_MATERIALS);
    localStorage.removeItem('@reflow:materials');
  };

  return (
    <DataContext.Provider value={{ materials, addMaterial, acceptMaterial, completeMaterial, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
