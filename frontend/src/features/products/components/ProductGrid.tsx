import React from "react";
import { ProductCard } from "../components/ProductCard";
import { PRODUCTS } from "../types/products";
import { Filter, ChevronDown } from "lucide-react";

export const ProductGrid = () => {
  return (
    <section className="py-24 bg-white px-6 max-w-7xl mx-auto">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 space-y-6 md:space-y-0">
        <div>
          <h2 className="text-3xl font-light text-[#111111] tracking-tight mb-2">Colección de Fragancias</h2>
          <p className="text-[#2B2B2B]/60 text-sm font-light">Explora nuestras creaciones exclusivas, diseñadas para cada momento.</p>
        </div>
        
        <div className="flex items-center space-x-8 border-b border-[#EDEDED] pb-2">
          <button className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#2B2B2B] hover:opacity-60 transition-opacity">
            <Filter size={14} strokeWidth={1.5} />
            <span>Filtrar</span>
          </button>
          <button className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#2B2B2B] hover:opacity-60 transition-opacity">
            <span>Ordenar</span>
            <ChevronDown size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* View All Button */}
      <div className="mt-20 flex justify-center">
        <button className="border-b border-[#2B2B2B] pb-2 text-xs uppercase tracking-[0.3em] text-[#2B2B2B] hover:opacity-50 transition-opacity font-medium">
          Ver toda la colección
        </button>
      </div>
    </section>
  );
};
