"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Id } from "../../convex/_generated/dataModel";

export type CartItem = {
  productId: Id<"products">;
  slug: string;
  name: string;
  image?: string;
  price: number;
  variantSku?: string;
  variantLabel?: string;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (productId: Id<"products">, variantSku?: string) => void;
  setQuantity: (productId: Id<"products">, quantity: number, variantSku?: string) => void;
  clear: () => void;
};

const lineKey = (productId: string, variantSku?: string) => `${productId}::${variantSku ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (item, quantity = 1) => {
        const items = [...get().items];
        const key = lineKey(item.productId, item.variantSku);
        const idx = items.findIndex((i) => lineKey(i.productId, i.variantSku) === key);
        if (idx >= 0) {
          const nextQty = Math.min(items[idx].quantity + quantity, items[idx].maxStock);
          items[idx] = { ...items[idx], quantity: nextQty };
        } else {
          items.push({ ...item, quantity: Math.min(quantity, item.maxStock) });
        }
        // Deliberately does NOT open the drawer. Throwing a full-screen
        // panel over the page after every tap interrupts browsing and
        // costs the shopper their place in the shelf they were reading.
        // The header badge pops and a toast confirms instead, with the
        // drawer one tap away from that toast.
        set({ items });
      },
      remove: (productId, variantSku) => {
        const key = lineKey(productId, variantSku);
        set({ items: get().items.filter((i) => lineKey(i.productId, i.variantSku) !== key) });
      },
      setQuantity: (productId, quantity, variantSku) => {
        const key = lineKey(productId, variantSku);
        set({
          items: get()
            .items.map((i) =>
              lineKey(i.productId, i.variantSku) === key
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
                : i
            )
            .filter((i) => i.quantity > 0),
        });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "reem-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { subtotal, count };
}
