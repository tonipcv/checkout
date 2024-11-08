'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/pagarmeApi';

interface Transaction {
  id: number;
  tid: number;
  nsu: number;
  date_created: string;
  date_updated: string;
  amount: number;
  authorized_amount: number;
  paid_amount: number;
  refunded_amount: number;
  installments: number;
  status: string;
  payment_method: string;
  card_holder_name: string | null;
  card_last_digits: string | null;
  card_first_digits: string | null;
  card_brand: string | null;
  postback_url: string | null;
  customer: {
    id: number;
    name: string;
    email: string;
    document_number: string | null;
    type: string;
  };
  items: Array<{
    id: string;
    title: string;
    unit_price: number;
    quantity: number;
    tangible: boolean;
  }>;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    if (!hasMore) return;

    try {
      setLoading(true);
      const response = await api.get('/transactions', {
        params: {
          api_key: process.env.NEXT_PUBLIC_PAGARME_API_KEY,
          count: 100,
          page: currentPage
        }
      });

      const newTransactions = response.data;
      
      if (newTransactions.length < 100) {
        setHasMore(false);
      }

      const sortedTransactions = [...transactions, ...newTransactions].sort((a, b) => 
        new Date(b.date_created).getTime() - new Date(a.date_created).getTime()
      );

      setTransactions(sortedTransactions);
      setCurrentPage(prev => prev + 1);
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      setError('Erro ao carregar transações');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTransactions();
    }
  };

  if (error && transactions.length === 0) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID/NSU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={`${transaction.id}-${transaction.date_created}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>ID: {transaction.id}</div>
                  <div className="text-xs text-gray-500">NSU: {transaction.nsu}</div>
                  <div className="text-xs text-gray-500">TID: {transaction.tid}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{transaction.customer.name}</div>
                  <div className="text-sm text-gray-500">{transaction.customer.email}</div>
                  <div className="text-xs text-gray-400">{transaction.customer.document_number}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {transaction.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className={index !== 0 ? 'mt-1' : ''}>
                        {item.title} ({item.quantity}x)
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {(transaction.amount / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                  {transaction.installments > 1 && (
                    <div className="text-xs text-gray-500">
                      {transaction.installments}x de {((transaction.amount / transaction.installments) / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {transaction.payment_method === 'credit_card' ? (
                      <div>
                        <div>Cartão de Crédito</div>
                        {transaction.card_brand && (
                          <div className="text-xs text-gray-500">
                            {transaction.card_brand.toUpperCase()} **** {transaction.card_last_digits}
                          </div>
                        )}
                      </div>
                    ) : transaction.payment_method === 'boleto' ? 'Boleto' :
                      transaction.payment_method === 'pix' ? 'PIX' :
                      transaction.payment_method}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${transaction.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : transaction.status === 'refused'
                      ? 'bg-red-100 text-red-800'
                      : transaction.status === 'refunded'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {transaction.status === 'paid' ? 'Pago' :
                     transaction.status === 'refused' ? 'Recusado' :
                     transaction.status === 'refunded' ? 'Reembolsado' :
                     transaction.status === 'waiting_payment' ? 'Aguardando Pagamento' :
                     transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.date_created).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 text-center">
        Total de transações: {transactions.length}
      </div>
    </div>
  );
} 