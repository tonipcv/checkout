'use client';
import { useFilters } from '@/contexts/FilterContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';

export default function Filters() {
  const { filters, setFilters } = useFilters();

  const handleFilterChange = (name: string, value: string) => {
    setFilters({ ...filters, [name]: value });
  };

  const debouncedSearch = debounce((value: string) => {
    handleFilterChange('search', value);
  }, 300);

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Busca */}
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          onChange={(e) => debouncedSearch(e.target.value)}
          className="bg-gray-800 block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Buscar por ID, cliente, email..."
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => handleFilterChange('status', e.target.value)}
        className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="all">Todos os Status</option>
        <option value="paid">Pago</option>
        <option value="refused">Recusado</option>
        <option value="waiting_payment">Aguardando Pagamento</option>
        <option value="refunded">Reembolsado</option>
      </select>

      {/* Método de Pagamento */}
      <select
        value={filters.paymentMethod}
        onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
        className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="all">Todos os Métodos</option>
        <option value="credit_card">Cartão de Crédito</option>
        <option value="boleto">Boleto</option>
        <option value="pix">PIX</option>
      </select>

      {/* Data Inicial */}
      <input
        type="date"
        value={filters.startDate}
        onChange={(e) => handleFilterChange('startDate', e.target.value)}
        className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      />

      {/* Data Final */}
      <input
        type="date"
        value={filters.endDate}
        onChange={(e) => handleFilterChange('endDate', e.target.value)}
        className="bg-gray-800 block w-full pl-3 pr-10 py-2 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
} 