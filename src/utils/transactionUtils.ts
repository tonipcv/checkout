import { Transaction } from '@/services/pagarmeApi';

interface Filters {
  status: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  search: string;
}

export function filterTransactions(transactions: Transaction[], filters: Filters) {
  return transactions.filter(transaction => {
    // Filtro de status
    if (filters.status !== 'all' && transaction.status !== filters.status) {
      return false;
    }

    // Filtro de método de pagamento
    if (filters.paymentMethod !== 'all' && transaction.payment_method !== filters.paymentMethod) {
      return false;
    }

    // Filtro de data
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      if (new Date(transaction.date_created) < startDate) {
        return false;
      }
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59);
      if (new Date(transaction.date_created) > endDate) {
        return false;
      }
    }

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        transaction.id.toString().includes(searchLower) ||
        transaction.customer.name.toLowerCase().includes(searchLower) ||
        transaction.customer.email.toLowerCase().includes(searchLower) ||
        (transaction.customer.document_number && 
         transaction.customer.document_number.includes(searchLower))
      );
    }

    return true;
  });
}

export function calculateSummary(transactions: Transaction[]) {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0) / 100;
  const paidAmount = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0) / 100;

  const statusCount = transactions.reduce((acc: Record<string, number>, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const paymentMethodCount = transactions.reduce((acc: Record<string, number>, t) => {
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
} 