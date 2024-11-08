'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/pagarmeApi';

export default function ApiTestPage() {
  const [customers, setCustomers] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Busca clientes
        const customersResponse = await api.get('/customers', {
          params: {
            page: 1,
            size: 10
          }
        });

        // Busca pedidos
        const ordersResponse = await api.get('/orders', {
          params: {
            page: 1,
            size: 10,
            created_since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_until: new Date().toISOString()
          }
        });

        setCustomers(customersResponse.data);
        setOrders(ordersResponse.data);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse text-center text-gray-500">
            Carregando dados da API...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-700 font-semibold">Erro ao carregar dados</h2>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Dados da API Pagar.me</h1>

        {/* Seção de Clientes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Clientes</h2>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
            {JSON.stringify(customers, null, 2)}
          </pre>
        </div>

        {/* Seção de Pedidos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pedidos (Últimos 30 dias)</h2>
          <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
            {JSON.stringify(orders, null, 2)}
          </pre>
        </div>

        {/* Informações de Debug */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações de Debug</h2>
          <div className="space-y-2">
            <p><strong>Base URL:</strong> {api.defaults.baseURL}</p>
            <p><strong>Headers:</strong></p>
            <pre className="bg-gray-50 p-4 rounded-md overflow-auto">
              {JSON.stringify(api.defaults.headers, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 