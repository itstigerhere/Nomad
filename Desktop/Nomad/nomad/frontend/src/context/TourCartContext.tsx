"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CartPlace = {
  id: number;
  name: string;
  city?: string;
  category?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  distanceKm?: number;
};

type TourCartContextType = {
  cart: CartPlace[];
  addToCart: (place: CartPlace) => void;
  removeFromCart: (placeId: number) => void;
  clearCart: () => void;
  isInCart: (placeId: number) => boolean;
  cartCount: number;
};

const TourCartContext = createContext<TourCartContextType | undefined>(undefined);

export function TourCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartPlace[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nomad_tour_cart");
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load cart from localStorage", err);
    }
    setHydrated(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem("nomad_tour_cart", JSON.stringify(cart));
      } catch (err) {
        console.error("Failed to save cart to localStorage", err);
      }
    }
  }, [cart, hydrated]);

  const addToCart = (place: CartPlace) => {
    setCart((prev) => {
      if (prev.find((p) => p.id === place.id)) {
        return prev; // Already in cart
      }
      return [...prev, place];
    });
  };

  const removeFromCart = (placeId: number) => {
    setCart((prev) => prev.filter((p) => p.id !== placeId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (placeId: number) => {
    return cart.some((p) => p.id === placeId);
  };

  return (
    <TourCartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartCount: cart.length,
      }}
    >
      {children}
    </TourCartContext.Provider>
  );
}

export function useTourCart() {
  const context = useContext(TourCartContext);
  if (!context) {
    throw new Error("useTourCart must be used within TourCartProvider");
  }
  return context;
}
