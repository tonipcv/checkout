export const mockTransactions = [
  {
    id: "1",
    amount: 250000,
    status: "paid",
    created_at: "2024-03-07T10:00:00Z",
    customer: {
      name: "João Silva",
      email: "joao@email.com"
    },
    payment_method: "credit_card",
    items: [
      {
        description: "iPhone 15 Pro",
        amount: 250000,
        quantity: 1
      }
    ]
  },
  // ... mais transações mock
];

export const mockDailySales = [
  { date: "07/03", vendas: 25000, pedidos: 12 },
  { date: "06/03", vendas: 32000, pedidos: 15 },
  { date: "05/03", vendas: 28000, pedidos: 13 },
  // ... mais dados
]; 