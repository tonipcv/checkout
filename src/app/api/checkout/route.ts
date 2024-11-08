import { NextResponse } from 'next/server';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.pagar.me/core/v5',
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json',
    'authorization': `Basic ${Buffer.from(process.env.NEXT_PUBLIC_PAGARME_API_KEY + ':').toString('base64')}`
  }
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Primeiro, cria ou atualiza o cliente
    const customerResponse = await api.post('/customers', {
      name: body.customer.name,
      email: body.customer.email,
      document: body.customer.document,
      type: body.customer.document.length > 11 ? 'company' : 'individual',
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: body.customer.phone.substring(0, 2),
          number: body.customer.phone.substring(2),
        }
      }
    });

    // Cria o pedido
    const orderData = {
      customer_id: customerResponse.data.id,
      items: [
        {
          amount: 10000, // Valor em centavos
          description: 'Produto Teste',
          quantity: 1,
          code: 'PROD-001'
        }
      ],
      payments: [
        {
          payment_method: body.payment.payment_method,
          ...(body.payment.payment_method === 'credit_card' && {
            credit_card: {
              card: {
                number: body.payment.card_number,
                holder_name: body.payment.card_holder_name,
                exp_month: parseInt(body.payment.card_expiration_date.split('/')[0]),
                exp_year: parseInt(body.payment.card_expiration_date.split('/')[1]),
                cvv: body.payment.card_cvv,
              },
              installments: body.payment.installments,
              statement_descriptor: 'Loja Test'
            }
          }),
          ...(body.payment.payment_method === 'pix' && {
            pix: {
              expires_in: 3600
            }
          }),
          ...(body.payment.payment_method === 'boleto' && {
            boleto: {
              due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              instructions: 'Pagar até a data de vencimento'
            }
          })
        }
      ],
      billing: {
        address: {
          country: body.billing.country,
          state: body.billing.state,
          city: body.billing.city,
          zip_code: body.billing.zip_code,
          line_1: body.billing.line_1,
          line_2: body.billing.line_2
        }
      }
    };

    const orderResponse = await api.post('/orders', orderData);

    return NextResponse.json(orderResponse.data);
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
} 