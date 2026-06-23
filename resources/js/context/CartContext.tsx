import { createContext, useCallback, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Product } from '../api/products';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_path?: string | null;
  stock_quantity: number;
  slug: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'UPDATE_QUANTITY'; id: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; items: CartItem[] };

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isEmpty: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'ecommerce_cart';

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.product.id
              ? { ...i, quantity: Math.min(i.quantity + (action.quantity || 1), i.stock_quantity) }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: action.product.id,
            name: action.product.name,
            price: action.product.price,
            image_path: action.product.image_path,
            stock_quantity: action.product.stock_quantity,
            slug: action.product.slug,
            quantity: action.quantity || 1,
          },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id
            ? { ...i, quantity: Math.min(action.quantity, i.stock_quantity) }
            : i
        ),
      };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'HYDRATE':
      return { ...state, items: action.items };

    default:
      return state;
  }
}

const initialState: CartState = { items: [] };

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { items: JSON.parse(stored) } : initialState;
    } catch {
      return initialState;
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', product, quantity });
  }, []);

  const removeItem = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_ITEM', id });
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isEmpty = state.items.length === 0;

  return (
    <CartContext.Provider
      value={{ items: state.items, totalItems, totalPrice, isEmpty, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};