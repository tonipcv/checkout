'use client';
import { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/20/solid';
import { getSalesSummary } from '../services/pagarmeApi';

interface StatItem {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  period: string;
}

export default function SalesSummaryCards() {
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    async function loadSummary() {
      const summary = await getSalesSummary();
      if (summary) {
        setStats([
          {
            name: 'Vendas Totais',
            value: summary.totalSales.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }),
            change: `${summary.percentChange}%`,
            changeType: Number(summary.percentChange) >= 0 ? 'positive' : 'negative',
            period: 'vs. mês anterior'
          },
          {
            name: 'Ticket Médio',
            value: summary.averageTicket.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }),
            change: '+5.2%',
            changeType: 'positive',
            period: 'vs. mês anterior'
          },
          {
            name: 'Total de Pedidos',
            value: summary.totalOrders.toString(),
            change: '+12.3%',
            changeType: 'positive',
            period: 'vs. mês anterior'
          },
          {
            name: 'Taxa de Conversão',
            value: '28.3%',
            change: '+3.2%',
            changeType: 'positive',
            period: 'vs. mês anterior'
          }
        ]);
      }
    }
    loadSummary();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className="absolute rounded-md bg-indigo-500 p-3">
              {/* Ícone será adicionado aqui */}
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <div className="ml-2">
              <p
                className={`flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500" />
                )}
                {stat.change}
              </p>
              <p className="text-xs text-gray-500">{stat.period}</p>
            </div>
          </dd>
        </div>
      ))}
    </div>
  );
} 