import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MenuItem } from '@shared/schema';

export interface CartItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (menuItem, quantity = 1, specialInstructions) => {
        set((state) => {
          const existingItem = state.items.find(item => item.menuItem.id === menuItem.id);
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.menuItem.id === menuItem.id
                  ? { 
                      ...item, 
                      quantity: item.quantity + quantity,
                      specialInstructions: specialInstructions || item.specialInstructions
                    }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, {
              id: Date.now(),
              menuItem,
              quantity,
              specialInstructions,
            }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const subtotal = get().getSubtotal();
        const deliveryFee = get().getDeliveryFee();
        return subtotal + deliveryFee;
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          return total + (parseFloat(item.menuItem.price) * item.quantity);
        }, 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 25 ? 0 : 2.99; // Free delivery over $25
      },
    }),
    {
      name: 'durger-king-cart',
    }
  )
);
