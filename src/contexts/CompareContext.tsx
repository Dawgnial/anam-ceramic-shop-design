import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CompareItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CompareContextType {
  items: CompareItem[];
  addToCompare: (item: CompareItem) => void;
  removeFromCompare: (id: string) => void;
  toggleCompare: (item: CompareItem) => void;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CompareItem[]>([]);

  const addToCompare = (item: CompareItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems;
      }
      return [...prevItems, item];
    });
  };

  const removeFromCompare = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const toggleCompare = (item: CompareItem) => {
    const existingItem = items.find(i => i.id === item.id);
    if (existingItem) {
      removeFromCompare(item.id);
    } else {
      addToCompare(item);
    }
  };

  const clearCompare = () => {
    setItems([]);
  };

  return (
    <CompareContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider');
  }
  return context;
};
