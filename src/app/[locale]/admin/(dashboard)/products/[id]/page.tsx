"use client";

import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../../../convex/_generated/api";
import { ProductForm } from "@/components/admin/product-form";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const product = useQuery(api.products.getById, { id: params.id as Id<"products"> });

  if (product === undefined) return null;
  if (product === null) return <p className="text-ink-soft">Product not found.</p>;

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-ink">Edit Product</h1>
      <ProductForm product={product} />
    </div>
  );
}
