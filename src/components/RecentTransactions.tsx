'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/pagarmeApi';
import { debounce } from 'lodash';

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

interface Filters {
  search: string;
  status: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: ''
  });

  const loadTransactions = useCallback(async () => {
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
  }, [currentPage, hasMore, transactions]);

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => 
        t.id.toString().includes(searchLower) ||
        t.customer.name.toLowerCase().includes(searchLower) ||
        t.customer.email.toLowerCase().includes(searchLower) ||
        (t.customer.document_number && t.customer.document_number.includes(searchLower))
      );
    }

    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Filtro de método de pagamento
    if (filters.paymentMethod) {
      filtered = filtered.filter(t => t.payment_method === filters.paymentMethod);
    }

    // Filtro de data
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(t => new Date(t.date_created) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(t => new Date(t.date_created) <= endDate);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const debouncedSearch = debounce((value: string) => {
    handleFilterChange('search', value);
  }, 300);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadTransactions();
    }
  };

  if (error && transactions.length === 0) {
    return <div className="py-4 text-center text-red-400">{error}</div>;
  }

  return (
    <div>
      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="text"
          placeholder="Buscar..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300"
        />
        <select
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300"
        >
          <option value="">Status</option>
          <option value="paid">Pago</option>
          <option value="refused">Recusado</option>
          <option value="waiting_payment">Aguardando Pagamento</option>
          <option value="refunded">Reembolsado</option>
        </select>
        <select
          onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
          className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300"
        >
          <option value="">Método de Pagamento</option>
          <option value="credit_card">Cartão de Crédito</option>
          <option value="boleto">Boleto</option>
          <option value="pix">PIX</option>
        </select>
        <input
          type="date"
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300"
        />
        <input
          type="date"
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300"
        />
      </div>

      {/* Tabela com transações filtradas */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID/NSU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Produtos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pagamento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <tr key={`${transaction.id}-${transaction.date_created}`} className="hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-200">ID: {transaction.id}</div>
                  <div className="text-xs text-gray-400">NSU: {transaction.nsu}</div>
                  <div className="text-xs text-gray-400">TID: {transaction.tid}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-200">{transaction.customer.name}</div>
                  <div className="text-sm text-gray-400">{transaction.customer.email}</div>
                  <div className="text-xs text-gray-500">{transaction.customer.document_number}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-200">
                    {transaction.items.map((item, index) => (
                      <div key={`${item.id}-${index}`} className={index !== 0 ? 'mt-1' : ''}>
                        {item.title} ({item.quantity}x)
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-200">
                    {(transaction.amount / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                  {transaction.installments > 1 && (
                    <div className="text-xs text-gray-400">
                      {transaction.installments}x de {((transaction.amount / transaction.installments) / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-200">
                    {transaction.payment_method === 'credit_card' ? (
                      <div>
                        <div>Cartão de Crédito</div>
                        {transaction.card_brand && (
                          <div className="text-xs text-gray-400">
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
                      ? 'bg-green-900 text-green-200' 
                      : transaction.status === 'refused'
                      ? 'bg-red-900 text-red-200'
                      : transaction.status === 'refunded'
                      ? 'bg-purple-900 text-purple-200'
                      : 'bg-yellow-900 text-yellow-200'}`}
                  >
                    {transaction.status === 'paid' ? 'Pago' :
                     transaction.status === 'refused' ? 'Recusado' :
                     transaction.status === 'refunded' ? 'Reembolsado' :
                     transaction.status === 'waiting_payment' ? 'Aguardando Pagamento' :
                     transaction.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
            className="px-4 py-2 border border-indigo-500 text-sm font-medium rounded-md text-indigo-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-400 text-center">
        Total de transações: {transactions.length}
      </div>
    </div>
  );
} 