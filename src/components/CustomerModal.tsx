'use client';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

interface CustomerDetails {
  id: number;
  name: string;
  email: string;
  document_number: string;
  phone_numbers?: string[];
  transactions: Array<{
    id: number;
    amount: number;
    status: string;
    date_created: string;
    payment_method: string;
    items: Array<{
      title: string;
      quantity: number;
      unit_price: number;
    }>;
  }>;
}

interface CustomerModalProps {
  customer: CustomerDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomerModal({ customer, isOpen, onClose }: CustomerModalProps) {
  if (!customer) return null;

  const totalAmount = customer.transactions.reduce((sum, t) => sum + t.amount, 0);
  const paidTransactions = customer.transactions.filter(t => t.status === 'paid');
  const averageTicket = paidTransactions.length > 0 
    ? paidTransactions.reduce((sum, t) => sum + t.amount, 0) / paidTransactions.length 
    : 0;

  const formatPhoneNumber = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return `(${numbers.slice(0,2)}) ${numbers.slice(2,7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0,2)}) ${numbers.slice(2,6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  // Função para obter produtos únicos e suas quantidades
  const getProductsSummary = () => {
    const productMap = new Map<string, { quantity: number; total: number }>();
    
    customer.transactions.forEach(transaction => {
      transaction.items?.forEach(item => {
        if (!productMap.has(item.title)) {
          productMap.set(item.title, { quantity: 0, total: 0 });
        }
        const current = productMap.get(item.title)!;
        productMap.set(item.title, {
          quantity: current.quantity + item.quantity,
          total: current.total + (item.unit_price * item.quantity)
        });
      });
    });

    return Array.from(productMap.entries())
      .map(([title, data]) => ({
        title,
        quantity: data.quantity,
        total: data.total
      }))
      .sort((a, b) => b.quantity - a.quantity);
  };

  const productsSummary = getProductsSummary();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-gray-800 text-gray-400 hover:text-gray-300"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-white mb-4">
                      Detalhes do Cliente
                    </Dialog.Title>

                    {/* Informações Básicas */}
                    <div className="bg-gray-700 rounded-lg p-4 mb-6">
                      <h4 className="text-lg font-medium text-white mb-3">Informações Pessoais</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Nome</p>
                          <p className="text-base text-white">{customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="text-base text-white">{customer.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Documento</p>
                          <p className="text-base text-white">{customer.document_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Telefones</p>
                          <div className="text-base text-white">
                            {customer.phone_numbers && customer.phone_numbers.length > 0 ? (
                              customer.phone_numbers.map((phone, index) => (
                                <p key={index}>{formatPhoneNumber(phone)}</p>
                              ))
                            ) : (
                              <p className="text-gray-500 italic">Não informado</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Financeiro */}
                    <div className="bg-gray-700 rounded-lg p-4 mb-6">
                      <h4 className="text-lg font-medium text-white mb-3">Resumo Financeiro</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Total em Compras</p>
                          <p className="text-base text-white">
                            {(totalAmount / 100).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Ticket Médio</p>
                          <p className="text-base text-white">
                            {(averageTicket / 100).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total de Transações</p>
                          <p className="text-base text-white">{customer.transactions.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Histórico de Transações */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-white mb-3">Histórico de Transações</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-600">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Data</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Valor</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Pagamento</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Itens</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-600">
                            {customer.transactions.map((transaction) => (
                              <tr key={transaction.id} className="hover:bg-gray-600">
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {new Date(transaction.date_created).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {(transaction.amount / 100).toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                  })}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-1 text-xs rounded-full
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
                                     transaction.status === 'waiting_payment' ? 'Aguardando' :
                                     transaction.status}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {transaction.payment_method === 'credit_card' ? 'Cartão de Crédito' :
                                   transaction.payment_method === 'boleto' ? 'Boleto' :
                                   transaction.payment_method === 'pix' ? 'PIX' :
                                   transaction.payment_method}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-300">
                                  {transaction.items && transaction.items.length > 0
                                    ? transaction.items.map(item => 
                                        `${item.title} (${item.quantity}x)`
                                      ).join(', ')
                                    : 'Sem itens'
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Nova seção de Produtos */}
                    <div className="bg-gray-700 rounded-lg p-4 mb-6">
                      <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                        <ShoppingBagIcon className="h-5 w-5 text-indigo-400" />
                        Produtos Comprados
                      </h4>
                      <div className="space-y-4">
                        {/* Tags de produtos */}
                        <div className="flex flex-wrap gap-2">
                          {productsSummary.map((product, index) => (
                            <div
                              key={index}
                              className="inline-flex items-center bg-gray-800 rounded-full px-3 py-1"
                            >
                              <span className="text-sm text-white">{product.title}</span>
                              <span className="ml-2 text-xs text-gray-400 bg-gray-700 rounded-full px-2 py-0.5">
                                {product.quantity}x
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Top 5 produtos mais comprados */}
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-400 mb-2">
                            Top 5 Produtos Mais Comprados
                          </h5>
                          <div className="space-y-2">
                            {productsSummary.slice(0, 5).map((product, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-800 rounded-lg p-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-indigo-400 font-medium">#{index + 1}</span>
                                  <span className="text-sm text-white">{product.title}</span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-white">
                                    {product.quantity} unidades
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {(product.total / 100).toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL'
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 