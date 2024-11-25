/* eslint-disable */
'use client';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/services/pagarmeApi';
import { Search, Users, ArrowLeft, CreditCard, Wallet, Receipt, RefreshCcw, Package } from 'lucide-react';
import CustomerModal from '@/components/CustomerModal';
import Link from 'next/link';

interface TransactionItem {
  title: string;
  quantity: number;
  unit_price: number;
}

interface Transaction {
  id: number;
  amount: number;
  status: string;
  date_created: string;
  payment_method: string;
  items: TransactionItem[];
}

interface Customer {
  id: number;
  name: string;
  email: string;
  document_number: string;
  phone_numbers?: string[];
  transactions: Transaction[];
}

interface CustomersByStatus {
  paid: Customer[];
  waiting_payment: Customer[];
  refused: Customer[];
  refunded: Customer[];
}

export default function CustomersPage() {
  const [selectedStatus, setSelectedStatus] = useState<keyof CustomersByStatus>('paid');
  const [customers, setCustomers] = useState<CustomersByStatus>({
    paid: [],
    waiting_payment: [],
    refused: [],
    refunded: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'paid',
    product: '',
    startDate: '',
    endDate: ''
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct] = useState<string>('');
  const [uniqueProducts, setUniqueProducts] = useState<string[]>([]);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions', {
        params: {
          count: 1000,
          api_key: process.env.NEXT_PUBLIC_PAGARME_API_KEY
        }
      });

      const transactions = response.data;
      const customerMap = new Map<number, Customer>();

      transactions.forEach((transaction: any) => {
        const customerId = transaction.customer.id;
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            name: transaction.customer.name,
            email: transaction.customer.email,
            document_number: transaction.customer.document_number,
            phone_numbers: transaction.customer.phone_numbers || [],
            transactions: []
          });
        }
        customerMap.get(customerId)?.transactions.push({
          id: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          date_created: transaction.date_created,
          payment_method: transaction.payment_method,
          items: transaction.items || []
        });
      });

      // Agrupa clientes por status de transação
      const customersByStatus: CustomersByStatus = {
        paid: [],
        waiting_payment: [],
        refused: [],
        refunded: []
      };

      customerMap.forEach(customer => {
        const statuses = new Set(customer.transactions.map(t => t.status));
        if (statuses.has('paid')) customersByStatus.paid.push(customer);
        if (statuses.has('waiting_payment')) customersByStatus.waiting_payment.push(customer);
        if (statuses.has('refused')) customersByStatus.refused.push(customer);
        if (statuses.has('refunded')) customersByStatus.refunded.push(customer);
      });

      setCustomers(customersByStatus);
      setUniqueProducts(extractUniqueProducts(customersByStatus));
    } catch (error: unknown) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const extractUniqueProducts = (customersByStatus: CustomersByStatus) => {
    const productsSet = new Set<string>();
    
    Object.values(customersByStatus).forEach((customerList: Customer[]) => {
      customerList.forEach((customer: Customer) => {
        customer.transactions.forEach((transaction: Transaction) => {
          transaction.items.forEach((item: TransactionItem) => {
            productsSet.add(item.title);
          });
        });
      });
    });

    return Array.from(productsSet).sort();
  };

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
    if (filters.status !== selectedStatus) {
      setSelectedStatus(filters.status as keyof CustomersByStatus);
    }
  };

  const filteredCustomers = customers[selectedStatus].filter(customer => {
    // Filtro de busca
    const matchesSearch = !appliedFilters.search || 
      customer.name.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
      customer.email.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
      customer.document_number?.includes(appliedFilters.search);

    // Filtro de produto
    const matchesProduct = !appliedFilters.product || 
      customer.transactions.some(transaction =>
        transaction.items?.some(item =>
          item.title === appliedFilters.product
        )
      );

    // Filtro de data
    const matchesDate = (!appliedFilters.startDate && !appliedFilters.endDate) ||
      customer.transactions.some(transaction => {
        const transactionDate = new Date(transaction.date_created);
        const afterStartDate = !appliedFilters.startDate || 
          transactionDate >= new Date(appliedFilters.startDate);
        const beforeEndDate = !appliedFilters.endDate || 
          transactionDate <= new Date(appliedFilters.endDate + 'T23:59:59');
        return afterStartDate && beforeEndDate;
      });

    return matchesSearch && matchesProduct && matchesDate;
  });

  const statusLabels = {
    paid: { 
      label: 'Compras Aprovadas', 
      Icon: CreditCard, 
      color: 'text-green-400' 
    },
    waiting_payment: { 
      label: 'Aguardando Pagamento', 
      Icon: Wallet, 
      color: 'text-yellow-400' 
    },
    refused: { 
      label: 'Compras Recusadas', 
      Icon: Receipt, 
      color: 'text-red-400' 
    },
    refunded: { 
      label: 'Compras Reembolsadas', 
      Icon: RefreshCcw, 
      color: 'text-purple-400' 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href="/"
                  className="mr-4 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6 text-gray-400" />
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Users className="h-8 w-8 text-indigo-500" />
                    Clientes
                  </h1>
                  <p className="mt-1 text-gray-400">
                    Visualize e gerencie todos os clientes por status de compra
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros Unificados */}
            <div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {/* Campo de busca */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Buscar por nome, email..."
                    className="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Filtro de produtos */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={filters.product}
                    onChange={(e) => handleFilterChange('product', e.target.value)}
                    className="bg-gray-700 block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  >
                    <option value="">Todos os Produtos</option>
                    {uniqueProducts.map((product) => (
                      <option key={product} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Data Inicial */}
                <div>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="bg-gray-700 block w-full px-3 py-2 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Data Final */}
                <div>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="bg-gray-700 block w-full px-3 py-2 border border-gray-600 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Botão de Aplicar Filtros */}
                <div className="flex items-end">
                  <button
                    onClick={applyFilters}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Aplicar Filtros
                  </button>
                </div>
              </div>

              {/* Chips de filtros ativos */}
              <div className="mt-4 flex flex-wrap gap-2">
                {appliedFilters.search && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-600/10 text-indigo-400">
                    Busca: {appliedFilters.search}
                  </span>
                )}
                {appliedFilters.product && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-600/10 text-indigo-400">
                    Produto: {appliedFilters.product}
                  </span>
                )}
                {appliedFilters.startDate && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-600/10 text-indigo-400">
                    A partir de: {new Date(appliedFilters.startDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
                {appliedFilters.endDate && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-600/10 text-indigo-400">
                    Até: {new Date(appliedFilters.endDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            {/* Botões de Status */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(statusLabels).map(([value, { label, Icon, color }]) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedStatus(value as keyof CustomersByStatus);
                    handleFilterChange('status', value);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStatus === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${selectedStatus === value ? 'text-white' : color}`} />
                  {label}
                </button>
              ))}
            </div>

            {/* Lista de Clientes */}
            <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 mt-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      {(() => {
                        const StatusIcon = statusLabels[selectedStatus].Icon;
                        return <StatusIcon className={`h-5 w-5 ${statusLabels[selectedStatus].color}`} />;
                      })()}
                      {statusLabels[selectedStatus].label}
                      <span className="ml-2 text-sm text-gray-400">
                        ({filteredCustomers.length} clientes)
                      </span>
                    </h2>
                    {selectedProduct && (
                      <span className="inline-flex items-center bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-full text-sm">
                        <Package className="h-4 w-4 mr-2" />
                        {selectedProduct}
                      </span>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total de Compras</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Última Compra</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredCustomers.map(customer => {
                        const totalAmount = customer.transactions
                          .filter(t => t.status === selectedStatus)
                          .reduce((sum, t) => sum + t.amount, 0);
                        const lastTransaction = [...customer.transactions]
                          .sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())[0];

                        return (
                          <tr 
                            key={customer.id} 
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsModalOpen(true);
                            }}
                            className="hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-white">{customer.name}</div>
                              <div className="text-sm text-gray-400">{customer.email}</div>
                              <div className="text-xs text-gray-500">{customer.document_number}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {customer.transactions.filter(t => t.status === selectedStatus).length}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {(totalAmount / 100).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-300">
                                {new Date(lastTransaction.date_created).toLocaleDateString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-400">
                                {lastTransaction.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                                 lastTransaction.payment_method === 'boleto' ? 'Boleto' :
                                 lastTransaction.payment_method === 'pix' ? 'PIX' :
                                 lastTransaction.payment_method}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal de Detalhes do Cliente */}
            <CustomerModal
              customer={selectedCustomer}
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedCustomer(null);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 