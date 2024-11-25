/* eslint-disable */
import RecentTransactions from "@/components/RecentTransactions";
import { api } from "@/services/pagarmeApi";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Users } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SalesData {
  total: number;
  orders: number;
  ordersList: Order[];
  success: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    fill: boolean;
  }[];
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  // Add other fields as needed
}

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  // Adicione outros campos necessários
}

async function getTransactionsSummary() {
  try {
    const response = await api.get('/transactions', {
      params: {
        count: 1000
      }
    });

    const transactions: Transaction[] = response.data;
    
    const totalAmount = transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0) / 100;
    const paidAmount = transactions
      .filter((t: Transaction) => t.status === 'paid')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0) / 100;
    
    const statusCount = transactions.reduce((acc: Record<string, number>, t: Transaction) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    const paymentMethodCount = transactions.reduce((acc: Record<string, number>, t: Transaction) => {
      acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
      return acc;
    }, {});

    return {
      totalTransactions: transactions.length,
      totalAmount,
      paidAmount,
      statusCount,
      paymentMethodCount
    };
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    return null;
  }
}

export default async function Home() {
  const summary = await getTransactionsSummary();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Header com Filtros */}
          <div className="mb-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold leading-7 text-white sm:text-4xl">
                  Dashboard de Transações
                </h1>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Link
                  href="/customers"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Ver Clientes
                </Link>
              </div>
            </div>
            
            {/* Barra de Filtros */}
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {/* Busca */}
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Buscar por ID, cliente, email..."
                  />
                </div>

                {/* Filtro de Status */}
                <div>
                  <select
                    className="bg-gray-700 block w-full pl-3 pr-10 py-2 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Status</option>
                    <option value="paid">Pago</option>
                    <option value="refused">Recusado</option>
                    <option value="waiting_payment">Aguardando Pagamento</option>
                    <option value="refunded">Reembolsado</option>
                  </select>
                </div>

                {/* Filtro de Método de Pagamento */}
                <div>
                  <select
                    className="bg-gray-700 block w-full pl-3 pr-10 py-2 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Método de Pagamento</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="boleto">Boleto</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>

                {/* Data Inicial */}
                <div>
                  <input
                    type="date"
                    className="bg-gray-700 block w-full pl-3 pr-3 py-2 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Data Final */}
                <div>
                  <input
                    type="date"
                    className="bg-gray-700 block w-full pl-3 pr-3 py-2 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Botão de Aplicar Filtros */}
                <div className="flex items-end">
                  <button
                    type="button"
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cards de Resumo */}
          {summary && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {[
                {
                  title: "Total de Transações",
                  value: summary.totalTransactions,
                  icon: (
                    <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                {
                  title: "Volume Total",
                  value: summary.totalAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }),
                  icon: (
                    <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  title: "Volume Aprovado",
                  value: summary.paidAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }),
                  icon: (
                    <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                },
                {
                  title: "Taxa de Aprovação",
                  value: `${((summary.statusCount.paid || 0) / summary.totalTransactions * 100).toFixed(1)}%`,
                  icon: (
                    <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                }
              ].map((card, index) => (
                <div key={index} className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {card.icon}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-400 truncate">
                            {card.title}
                          </dt>
                          <dd className="text-lg font-semibold text-white">
                            {card.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Status e Métodos de Pagamento */}
          {summary && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
              <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-white mb-4">
                    Status das Transações
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(summary.statusCount).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-block h-3 w-3 rounded-full mr-2
                            ${status === 'paid' ? 'bg-green-500' :
                              status === 'refused' ? 'bg-red-500' :
                              status === 'refunded' ? 'bg-purple-500' :
                              'bg-yellow-500'}`}
                          />
                          <span className="text-sm text-gray-300 capitalize">
                            {status === 'paid' ? 'Pago' :
                             status === 'refused' ? 'Recusado' :
                             status === 'refunded' ? 'Reembolsado' :
                             status === 'waiting_payment' ? 'Aguardando Pagamento' :
                             status}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-700">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-white mb-4">
                    Métodos de Pagamento
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(summary.paymentMethodCount).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          {method === 'credit_card' ? 'Cartão de Crédito' :
                           method === 'boleto' ? 'Boleto' :
                           method === 'pix' ? 'PIX' :
                           method}
                        </span>
                        <span className="text-sm font-medium text-white">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Transações - Agora com largura total */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium text-white mb-4">Últimas Transações</h2>
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  <RecentTransactions />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
