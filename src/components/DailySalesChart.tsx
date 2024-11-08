'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/services/pagarmeApi';

interface SalesData {
  date: string;
  vendas: number;
  pedidos: number;
}

export default function DailySalesChart() {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSales() {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const response = await api.get('/orders', {
          params: {
            created_since: startDate.toISOString(),
            created_until: endDate.toISOString(),
            page: 1,
            size: 100
          }
        });

        const salesByDate = response.data.data.reduce((acc: any, order: any) => {
          const date = new Date(order.created_at).toLocaleDateString('pt-BR');
          if (!acc[date]) {
            acc[date] = { vendas: 0, pedidos: 0 };
          }
          acc[date].vendas += order.amount / 100;
          acc[date].pedidos += 1;
          return acc;
        }, {});

        const chartData = Object.entries(salesByDate).map(([date, data]: [string, any]) => ({
          date,
          vendas: data.vendas,
          pedidos: data.pedidos
        }));

        setData(chartData);
      } catch (error) {
        console.error('Erro ao carregar vendas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSales();
  }, []);

  if (loading) {
    return <div className="h-64 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => 
              [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Vendas']
            }
          />
          <Line
            type="monotone"
            dataKey="vendas"
            name="Vendas"
            stroke="#4F46E5"
            fill="#4F46E5"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 