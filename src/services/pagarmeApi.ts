import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.pagar.me/1',
  params: {
    api_key: process.env.NEXT_PUBLIC_PAGARME_API_KEY
  }
});

export interface Transaction {
  object: string;
  status: string;
  refuse_reason: string | null;
  status_reason: string;
  acquirer_response_code: string | null;
  acquirer_name: string;
  acquirer_id: string;
  authorization_code: string | null;
  soft_descriptor: string | null;
  tid: number;
  nsu: number;
  date_created: string;
  date_updated: string;
  amount: number;
  authorized_amount: number;
  paid_amount: number;
  refunded_amount: number;
  installments: number;
  id: number;
  cost: number;
  card_holder_name: string | null;
  card_last_digits: string | null;
  card_first_digits: string | null;
  card_brand: string | null;
  payment_method: string;
  customer: {
    object: string;
    id: number;
    external_id: string;
    type: string;
    country: string;
    document_number: string | null;
    document_type: string;
    name: string;
    email: string;
    phone_numbers: string[];
    born_at: string | null;
    birthday: string | null;
    gender: string | null;
    date_created: string;
    documents: Array<{
      object: string;
      id: string;
      type: string;
      number: string;
    }>;
  };
  items: Array<{
    object: string;
    id: string;
    title: string;
    unit_price: number;
    quantity: number;
    category: string | null;
    tangible: boolean;
    venue: string | null;
    date: string | null;
  }>;
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
}

export async function getDailySales(days: number = 7) {
  try {
    const transactions = await getTransactions();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date_created);
      return transactionDate >= startDate && transaction.status === 'paid';
    });

    const dailySales = filteredTransactions.reduce((acc: Record<string, { total: number; count: number }>, transaction) => {
      const date = new Date(transaction.date_created).toLocaleDateString('pt-BR');
      if (!acc[date]) {
        acc[date] = { total: 0, count: 0 };
      }
      acc[date].total += transaction.amount / 100;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.entries(dailySales)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, data]) => ({
        date,
        vendas: data.total,
        pedidos: data.count
      }));
  } catch (error) {
    console.error('Erro ao buscar vendas diárias:', error);
    throw error;
  }
}

export async function getSalesSummary() {
  try {
    const transactions = await getTransactions();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const currentMonthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date_created);
      return date >= thirtyDaysAgo && transaction.status === 'paid';
    });

    const previousMonthTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.date_created);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo && transaction.status === 'paid';
    });

    const currentTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0) / 100;
    const previousTotal = previousMonthTransactions.reduce((sum, t) => sum + t.amount, 0) / 100;
    const percentChange = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0;

    return {
      totalSales: currentTotal,
      percentChange: percentChange.toFixed(1),
      averageTicket: currentMonthTransactions.length > 0 ? currentTotal / currentMonthTransactions.length : 0,
      totalOrders: currentMonthTransactions.length,
      paidOrders: currentMonthTransactions.filter(t => t.status === 'paid').length,
      conversionRate: currentMonthTransactions.length > 0 
        ? (currentMonthTransactions.filter(t => t.status === 'paid').length / currentMonthTransactions.length) * 100 
        : 0
    };
  } catch (error) {
    console.error('Erro ao buscar resumo de vendas:', error);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const response = await api.get('/transactions', {
      params: {
        count: 1
      }
    });
    return Array.isArray(response.data);
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
}

export { api };