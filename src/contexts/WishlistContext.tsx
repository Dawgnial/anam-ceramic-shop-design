import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (item: WishlistItem) => boolean;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => boolean;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const isInWishlist = useCallback((id: string) => {
    return items.some(item => item.id === id);
  }, [items]);

  const addToWishlist = useCallback((item: WishlistItem): boolean => {
    if (items.some(i => i.id === item.id)) {
      return false;
    }
    setItems(prevItems => [...prevItems, item]);
    return true;
  }, [items]);

  const removeFromWishlist = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const toggleWishlist = useCallback((item: WishlistItem): boolean => {
    const exists = items.some(i => i.id === item.id);
    if (exists) {
      setItems(prevItems => prevItems.filter(i => i.id !== item.id));
      return false;
    } else {
      setItems(prevItems => [...prevItems, item]);
      return true;
    }
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
