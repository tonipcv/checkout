'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    document: z.string().min(11, 'CPF/CNPJ inválido'),
    phone: z.string().min(10, 'Telefone inválido'),
  }),
  billing: z.object({
    line_1: z.string().min(5, 'Endereço inválido'),
    line_2: z.string().optional(),
    zip_code: z.string().min(8, 'CEP inválido'),
    city: z.string().min(2, 'Cidade inválida'),
    state: z.string().length(2, 'Estado inválido'),
    country: z.string().default('BR'),
  }),
  payment: z.object({
    payment_method: z.enum(['credit_card', 'pix', 'boleto']),
    card_number: z.string().optional(),
    card_holder_name: z.string().optional(),
    card_expiration_date: z.string().optional(),
    card_cvv: z.string().optional(),
    installments: z.number().min(1).max(12).optional(),
  }),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema)
  });

  const onSubmit = async (data: CheckoutData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      const result = await response.json();
      // Redirecionar para página de sucesso ou mostrar QR code do PIX
      console.log(result);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = "mt-1 block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 text-base";
  const labelClassName = "block text-sm font-medium text-gray-700 mb-1";
  const errorClassName = "mt-1 text-sm text-red-600";

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Informações do Cliente */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className={labelClassName}>
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        {...register('customer.name')}
                        className={inputClassName}
                        placeholder="Digite seu nome completo"
                      />
                      {errors.customer?.name && (
                        <p className={errorClassName}>{errors.customer.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={labelClassName}>
                        Email
                      </label>
                      <input
                        type="email"
                        {...register('customer.email')}
                        className={inputClassName}
                        placeholder="seu@email.com"
                      />
                      {errors.customer?.email && (
                        <p className={errorClassName}>{errors.customer.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClassName}>
                          CPF/CNPJ
                        </label>
                        <input
                          type="text"
                          {...register('customer.document')}
                          className={inputClassName}
                          placeholder="000.000.000-00"
                        />
                        {errors.customer?.document && (
                          <p className={errorClassName}>{errors.customer.document.message}</p>
                        )}
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Telefone
                        </label>
                        <input
                          type="tel"
                          {...register('customer.phone')}
                          className={inputClassName}
                          placeholder="(00) 00000-0000"
                        />
                        {errors.customer?.phone && (
                          <p className={errorClassName}>{errors.customer.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Endereço de Cobrança */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Endereço de Cobrança</h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className={labelClassName}>
                        Endereço
                      </label>
                      <input
                        type="text"
                        {...register('billing.line_1')}
                        className={inputClassName}
                        placeholder="Rua, número"
                      />
                    </div>

                    <div>
                      <label className={labelClassName}>
                        Complemento
                      </label>
                      <input
                        type="text"
                        {...register('billing.line_2')}
                        className={inputClassName}
                        placeholder="Apartamento, sala, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelClassName}>
                          CEP
                        </label>
                        <input
                          type="text"
                          {...register('billing.zip_code')}
                          className={inputClassName}
                          placeholder="00000-000"
                        />
                      </div>

                      <div>
                        <label className={labelClassName}>
                          Cidade
                        </label>
                        <input
                          type="text"
                          {...register('billing.city')}
                          className={inputClassName}
                          placeholder="Sua cidade"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClassName}>
                        Estado
                      </label>
                      <input
                        type="text"
                        {...register('billing.state')}
                        maxLength={2}
                        className={inputClassName}
                        placeholder="UF"
                      />
                    </div>
                  </div>
                </div>

                {/* Método de Pagamento */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Método de Pagamento</h2>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('credit_card')}
                        className={`px-6 py-3 rounded-lg font-medium text-base transition-colors ${
                          selectedPaymentMethod === 'credit_card'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Cartão de Crédito
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('pix')}
                        className={`px-6 py-3 rounded-lg font-medium text-base transition-colors ${
                          selectedPaymentMethod === 'pix'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        PIX
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod('boleto')}
                        className={`px-6 py-3 rounded-lg font-medium text-base transition-colors ${
                          selectedPaymentMethod === 'boleto'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Boleto
                      </button>
                    </div>

                    {selectedPaymentMethod === 'credit_card' && (
                      <div className="space-y-6 bg-white p-6 rounded-lg">
                        <div>
                          <label className={labelClassName}>
                            Número do Cartão
                          </label>
                          <input
                            type="text"
                            {...register('payment.card_number')}
                            className={inputClassName}
                            placeholder="0000 0000 0000 0000"
                          />
                        </div>

                        <div>
                          <label className={labelClassName}>
                            Nome no Cartão
                          </label>
                          <input
                            type="text"
                            {...register('payment.card_holder_name')}
                            className={inputClassName}
                            placeholder="Nome como está no cartão"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className={labelClassName}>
                              Data de Validade
                            </label>
                            <input
                              type="text"
                              {...register('payment.card_expiration_date')}
                              placeholder="MM/AA"
                              className={inputClassName}
                            />
                          </div>

                          <div>
                            <label className={labelClassName}>
                              CVV
                            </label>
                            <input
                              type="text"
                              {...register('payment.card_cvv')}
                              maxLength={4}
                              className={inputClassName}
                              placeholder="000"
                            />
                          </div>
                        </div>

                        <div>
                          <label className={labelClassName}>
                            Parcelas
                          </label>
                          <select
                            {...register('payment.installments')}
                            className={inputClassName}
                          >
                            {[...Array(12)].map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                {i + 1}x {i === 0 ? 'sem juros' : 'com juros'}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Submit */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Processando...' : 'Finalizar Compra'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 