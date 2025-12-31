import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  attributes?: Record<string, string>;
  // New fields for weight-based shipping
  weight_with_packaging?: number; // in grams
  preparation_days?: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getTotalWeight: () => number;
  getMaxPreparationDays: () => number;
  getShippingCost: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'anam_cart';

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      return JSON.parse(storedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Calculate shipping cost based on weight
// First 1kg = 80,000 تومان
// Each additional kg = 30,000 تومان
const calculateShippingCost = (totalWeightGrams: number): number => {
  if (totalWeightGrams <= 0) return 0;
  
  const totalWeightKg = totalWeightGrams / 1000;
  
  if (totalWeightKg <= 1) {
    return 80000;
  }
  
  // First kg = 80,000, additional kgs = 30,000 each
  const additionalKg = Math.ceil(totalWeightKg - 1);
  return 80000 + (additionalKg * 30000);
};

// Merge local cart with database cart (combine quantities for same items)
const mergeCarts = (localItems: CartItem[], dbItems: CartItem[]): CartItem[] => {
  const mergedMap = new Map<string, CartItem>();
  
  // Add db items first
  dbItems.forEach(item => {
    const key = `${item.id}-${item.color || ''}`;
    mergedMap.set(key, item);
  });
  
  // Merge local items (add quantity if exists, otherwise add new)
  localItems.forEach(item => {
    const key = `${item.id}-${item.color || ''}`;
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!;
      mergedMap.set(key, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      mergedMap.set(key, item);
    }
  });
  
  return Array.from(mergedMap.values());
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [isLoading, setIsLoading] = useState(false);
  const isInitialMount = useRef(true);
  const isSyncing = useRef(false);

  // Load cart from database when user logs in
  useEffect(() => {
    const loadCartFromDb = async () => {
      if (!user) {
        // User logged out, keep local cart
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_carts')
          .select('items')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading cart from database:', error);
          return;
        }

        const localCart = loadCartFromStorage();
        const dbCart = (data?.items as unknown as CartItem[]) || [];

        // Merge local cart with database cart
        if (localCart.length > 0 && dbCart.length > 0) {
          const mergedCart = mergeCarts(localCart, dbCart);
          setItems(mergedCart);
          // Clear local storage after merging
          localStorage.removeItem(CART_STORAGE_KEY);
          // Save merged cart to database
          await saveCartToDb(user.id, mergedCart);
        } else if (localCart.length > 0) {
          // Only local cart exists, save to database
          setItems(localCart);
          localStorage.removeItem(CART_STORAGE_KEY);
          await saveCartToDb(user.id, localCart);
        } else if (dbCart.length > 0) {
          // Only database cart exists
          setItems(dbCart);
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartFromDb();
  }, [user]);

  // Save cart to database
  const saveCartToDb = async (userId: string, cartItems: CartItem[]) => {
    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      const { error } = await supabase
        .from('user_carts')
        .upsert({
          user_id: userId,
          items: cartItems as unknown as Record<string, unknown>[],
          updated_at: new Date().toISOString()
        } as any, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving cart to database:', error);
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    } finally {
      isSyncing.current = false;
    }
  };

  // Save to localStorage or database whenever items change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (user) {
      // Save to database for logged-in users
      saveCartToDb(user.id, items);
    } else {
      // Save to localStorage for guests
      saveCartToStorage(items);
    }
  }, [items, user]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id && i.color === item.color);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id && i.color === item.color ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  // Calculate total weight in grams
  const getTotalWeight = useCallback(() => {
    return items.reduce((total, item) => {
      const weight = item.weight_with_packaging || 0;
      return total + (weight * item.quantity);
    }, 0);
  }, [items]);

  // Get maximum preparation days among all items
  const getMaxPreparationDays = useCallback(() => {
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.preparation_days || 1));
  }, [items]);

  // Get shipping cost based on total weight
  const getShippingCost = useCallback(() => {
    const totalWeight = getTotalWeight();
    return calculateShippingCost(totalWeight);
  }, [getTotalWeight]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getTotalWeight,
        getMaxPreparationDays,
        getShippingCost,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};