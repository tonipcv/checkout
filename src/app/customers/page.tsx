'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/pagarmeApi';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CustomerModal from '@/components/CustomerModal';

interface Transaction {
  id: number;
  amount: number;
  status: string;
  date_created: string;
  payment_method: string;
  items?: Array<{
    title: string;
    quantity: number;
    unit_price: number;
  }>;
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
  const [customers, setCustomers] = useState<CustomersByStatus>({
    paid: [],
    waiting_payment: [],
    refused: [],
    refunded: []
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<keyof CustomersByStatus>('paid');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
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

      // Agrupa transações por cliente e inclui os items
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
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = customers[selectedStatus].filter(customer => 
    search === '' || 
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    customer.email.toLowerCase().includes(search.toLowerCase()) ||
    customer.document_number?.includes(search)
  );

  const statusLabels = {
    paid: 'Compras Aprovadas',
    waiting_payment: 'Aguardando Pagamento',
    refused: 'Compras Recusadas',
    refunded: 'Compras Reembolsadas'
  };

  const statusColors = {
    paid: 'bg-green-500',
    waiting_payment: 'bg-yellow-500',
    refused: 'bg-red-500',
    refunded: 'bg-purple-500'
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
            <h1 className="text-3xl font-bold text-white">Clientes por Status</h1>
            
            {/* Filtros */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, email ou documento..."
                  className="bg-gray-800 block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md text-gray-300 placeholder-gray-400"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as keyof CustomersByStatus)}
                className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lista de Clientes */}
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {statusLabels[selectedStatus]} ({filteredCustomers.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total de Compras</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Última Compra</th>
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
                          className="hover:bg-gray-700 cursor-pointer"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsModalOpen(true);
                          }}
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
  );
} 