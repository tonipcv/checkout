import { NextResponse } from 'next/server';

interface Charge {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  paid_amount: number;
  paid_at: string | null;
  created_at: string;
}

interface Customer {
  name: string;
  email: string;
  document: string;
  document_type: string;
  phones?: {
    mobile_phone?: {
      country_code: string;
      number: string;
      area_code: string;
    };
  };
}

interface Address {
  street: string;
  number: string;
  complement?: string;
  zip_code: string;
  city: string;
  state: string;
  country: string;
  neighborhood: string;
}

interface Order {
  id: string;
  code: string;
  amount: number;
  currency: string;
  closed: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  customer: Customer;
  shipping?: {
    amount: number;
    description: string;
    address: Address;
  };
  items: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    quantity: number;
    status: string;
  }>;
  charges: Array<Charge>;
}

async function getTotalSales() {
  try {
    const apiKey = process.env.PAGARME_API_KEY;
    
    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resposta da API:', errorText);
      throw new Error(`Erro na API do Pagar.me: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    const totalAmount = data.data?.reduce((acc: number, order: Order) => {
      return acc + (order.amount / 100);
    }, 0) || 0;

    // Processa os dados mantendo todas as informações
    const orders = data.data?.map((order: Order) => ({
      id: order.id,
      code: order.code,
      // Cliente
      customer: {
        name: order.customer?.name || 'N/A',
        email: order.customer?.email || 'N/A',
        document: order.customer?.document || 'N/A',
        documentType: order.customer?.document_type || 'N/A',
        phone: order.customer?.phones?.mobile_phone ? 
          `+${order.customer.phones.mobile_phone.country_code} (${order.customer.phones.mobile_phone.area_code}) ${order.customer.phones.mobile_phone.number}` : 
          'N/A'
      },
      // Endereço de entrega
      shipping: order.shipping ? {
        amount: order.shipping.amount / 100,
        description: order.shipping.description,
        address: order.shipping.address
      } : null,
      // Valores
      amount: order.amount / 100,
      currency: order.currency,
      // Status
      status: order.status,
      closed: order.closed,
      // Itens do pedido
      items: order.items.map(item => ({
        ...item,
        amount: item.amount / 100
      })),
      // Pagamento
      charges: order.charges.map(charge => ({
        id: charge.id,
        amount: charge.amount / 100,
        paidAmount: charge.paid_amount / 100,
        status: charge.status,
        paymentMethod: charge.payment_method,
        paidAt: charge.paid_at ? new Date(charge.paid_at).toLocaleString('pt-BR') : null,
        createdAt: new Date(charge.created_at).toLocaleString('pt-BR')
      })),
      // Datas
      createdAt: new Date(order.created_at).toLocaleString('pt-BR'),
      updatedAt: new Date(order.updated_at).toLocaleString('pt-BR')
    })) || [];

    return { 
      total: totalAmount,
      orders: orders.length,
      ordersList: orders,
      success: true
    };
  } catch (error) {
    console.error('Erro detalhado ao buscar vendas:', error);
    throw error;
  }
}

export async function GET() {
  try {
    if (!process.env.PAGARME_API_KEY) {
      return NextResponse.json(
        { error: 'Chave da API não configurada' },
        { status: 500 }
      );
    }

    const sales = await getTotalSales();
    return NextResponse.json(sales);
  } catch (error) {
    console.error('Erro na rota GET:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao buscar total de vendas',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 