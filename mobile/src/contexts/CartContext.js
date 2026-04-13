import React, { createContext, useState, useContext } from "react";

export const CartContext = createContext({});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCartItem = (productId, sizeName, newQuantity, obs) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === productId && item.size.name === sizeName) {
          return { ...item, quantity: newQuantity, observation: obs };
        }
        return item;
      }),
    );
  };

  const addToCart = (product, size, quantity, obs = "") => {
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

  const removeFromCart = (productId, sizeName) => {
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
    <CartContext.Provider
      value={{
        cartItems,
        updateCartItem,
        addToCart,
        removeFromCart,
        cartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
