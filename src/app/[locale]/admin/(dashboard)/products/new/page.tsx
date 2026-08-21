"use client";

import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-ink">Add Product</h1>
      <ProductForm />
    </div>
  );
}
