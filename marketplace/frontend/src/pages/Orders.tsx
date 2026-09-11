import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import type { Order } from '../types';

interface Paged<T> { content: T[]; totalPages: number; }

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', PREPARING: 'En préparation',
  READY_FOR_DELIVERY: 'Prête pour livraison', DELIVERING: 'En livraison',
  DELIVERED: 'Livrée', CANCELLED: 'Annulée',
};

export default function Orders() {
  const orders = useQuery({
    queryKey: ['orders'],
    queryFn: async () => (await api.get<Paged<Order>>('/orders')).data,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mes commandes</h1>
      {(orders.data?.content ?? []).length === 0 && (
        <p className="text-center py-16 opacity-70">Vous n'avez pas encore passé de commande.</p>
      )}
      <div className="space-y-4">
        {(orders.data?.content ?? []).map((order) => (
          <div key={order.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <p className="font-semibold">Commande du {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                <span className="badge">{STATUS_LABELS[order.status] ?? order.status}</span>
              </div>
              {order.sellerOrders.map((so) => (
                <div key={so.id} className="mt-2 pl-4 border-l-4 border-primary">
                  <p className="text-sm font-semibold">{so.shopName} — {formatPrice(so.subtotalMinor, so.currency)}</p>
                  <ul className="text-sm opacity-80 list-disc list-inside">
                    {so.items.map((line) => (
                      <li key={line.productId}>{line.quantity} × {line.productName}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-right font-bold mt-2">Total : {formatPrice(order.totalMinor, order.currency)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
