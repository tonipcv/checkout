'use client';
import { useEffect, useState } from 'react';
import { getCategorySales } from '../services/pagarmeApi';

interface Category {
  name: string;
  total: number;
  percentage: number;
  items: string[];
  growth: string;
}

export default function SalesDisplay() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const categoriesData = await getCategorySales();
      setCategories(categoriesData);
    }
    loadCategories();
  }, []);

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.name} className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{category.name}</h3>
            <span className="text-green-600 text-sm font-medium">{category.growth}</span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de vendas</span>
              <span className="font-semibold">
                {category.total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full" 
                style={{ width: `${category.percentage}%` }}
              ></div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Produtos mais vendidos: {category.items.join(', ')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 