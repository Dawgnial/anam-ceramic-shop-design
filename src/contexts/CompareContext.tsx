import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface CompareItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface CompareContextType {
  items: CompareItem[];
  addToCompare: (item: CompareItem) => boolean;
  removeFromCompare: (id: string) => void;
  toggleCompare: (item: CompareItem) => boolean;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CompareItem[]>([]);

  const isInCompare = useCallback((id: string) => {
    return items.some(item => item.id === id);
  }, [items]);

  const addToCompare = useCallback((item: CompareItem): boolean => {
    if (items.some(i => i.id === item.id)) {
      return false;
    }
    setItems(prevItems => [...prevItems, item]);
    return true;
  }, [items]);

  const removeFromCompare = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const toggleCompare = useCallback((item: CompareItem): boolean => {
    const exists = items.some(i => i.id === item.id);
    if (exists) {
      setItems(prevItems => prevItems.filter(i => i.id !== item.id));
      return false;
    } else {
      setItems(prevItems => [...prevItems, item]);
      return true;
    }
  }, [items]);

  const clearCompare = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        isInCompare,
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
