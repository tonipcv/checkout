import RecentTransactions from "@/components/RecentTransactions";
import { api } from "@/services/pagarmeApi";

async function getTransactionsSummary() {
  try {
    const response = await api.get('/transactions', {
      params: {
        count: 1000 // Busca um número maior para ter uma visão mais precisa
      }
    });

    const transactions = response.data;
    
    // Calcula totais
    const totalAmount = transactions.reduce((sum: number, t: any) => sum + t.amount, 0) / 100;
    const paidAmount = transactions
      .filter((t: any) => t.status === 'paid')
      .reduce((sum: number, t: any) => sum + t.amount, 0) / 100;
    
    // Contagem por status
    const statusCount = transactions.reduce((acc: any, t: any) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});

    // Contagem por método de pagamento
    const paymentMethodCount = transactions.reduce((acc: any, t: any) => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-7 text-gray-900 sm:text-4xl">
                Dashboard de Transações
              </h1>
            </div>
          </div>

          {/* Cards de Resumo */}
          {summary && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total de Transações
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {summary.totalTransactions}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Volume Total
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {summary.totalAmount.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Volume Aprovado
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {summary.paidAmount.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Taxa de Aprovação
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {((summary.statusCount.paid || 0) / summary.totalTransactions * 100).toFixed(1)}%
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status e Métodos de Pagamento */}
          {summary && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Status das Transações
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(summary.statusCount).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`inline-block h-3 w-3 rounded-full mr-2
                            ${status === 'paid' ? 'bg-green-400' :
                              status === 'refused' ? 'bg-red-400' :
                              status === 'refunded' ? 'bg-purple-400' :
                              'bg-yellow-400'}`}
                          />
                          <span className="text-sm text-gray-600 capitalize">
                            {status === 'paid' ? 'Pago' :
                             status === 'refused' ? 'Recusado' :
                             status === 'refunded' ? 'Reembolsado' :
                             status === 'waiting_payment' ? 'Aguardando Pagamento' :
                             status}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Métodos de Pagamento
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(summary.paymentMethodCount).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {method === 'credit_card' ? 'Cartão de Crédito' :
                           method === 'boleto' ? 'Boleto' :
                           method === 'pix' ? 'PIX' :
                           method}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Transações */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Últimas Transações</h2>
              <RecentTransactions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
