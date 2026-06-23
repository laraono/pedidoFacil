import React, { createContext, useState, useContext } from "react";

export interface CartItemSize {
  id?: number
  name: string
  price: number
}

export interface CartItem {
  id: number
  name: string
  size: CartItemSize
  quantity: number
  observation: string
  image?: string | null
  description?: string
  basePrice?: number
  categoryId?: number
  category?: { id: number }
  productVariations?: any[]
}

interface CartContextType {
  cartItems: CartItem[]
  updateCartItem: (productId: number, sizeName: string, newQuantity: number, obs: string) => void
  addToCart: (product: any, size: CartItemSize, quantity: number, obs?: string) => void
  removeFromCart: (productId: number, sizeName: string) => void
  cartTotal: number
  clearCart: () => void
}

export const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const clearCart = () => setCartItems([]);

  const updateCartItem = (productId: number, sizeName: string, newQuantity: number, obs: string) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === productId && item.size.name === sizeName) {
          return { ...item, quantity: newQuantity, observation: obs };
        }
        return item;
      }),
    );
  };

  const addToCart = (product: any, size: CartItemSize, quantity: number, obs = "") => {
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.id === product.id &&
          item.size.name === size.name &&
          item.observation === obs,
      );

      if (existingItemIndex >= 0) {
        const newItems = [...prev];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      } else {
        return [...prev, { ...product, size, quantity, observation: obs }];
      }
    });
  };

  const removeFromCart = (productId: number, sizeName: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === productId && item.size.name === sizeName),
      ),
    );
  };

  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.size.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cartItems, updateCartItem, addToCart, removeFromCart, cartTotal, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
