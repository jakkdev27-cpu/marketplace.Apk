import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { errorMessage, formatPrice } from '../utils/format';
import type { Cart as CartType, CartItem } from '../types';

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const cart = useQuery({
    queryKey: ['cart'],
    queryFn: async () => (await api.get<CartType>('/cart')).data,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const updateQty = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch(`/cart/items/${itemId}`, { quantity }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (itemId: string) => api.delete(`/cart/items/${itemId}`),
    onSuccess: refresh,
  });

  const checkout = useMutation({
    mutationFn: () => api.post('/orders/checkout'),
    onSuccess: () => {
      refresh();
      navigate('/orders');
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const items = cart.data?.items ?? [];
  const byShop = items.reduce<Record<string, CartItem[]>>((acc: Record<string, CartItem[]>, item: CartItem) => {
    (acc[item.shopId] = acc[item.shopId] ?? []).push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon panier</h1>
      {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="mb-4 opacity-70">Votre panier est vide.</p>
          <Link to="/products" className="btn btn-primary">Découvrir le catalogue</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byShop).map(([shopId, shopItems]) => (
            <div key={shopId} className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title">{shopItems[0].shopName}</h2>
                {(shopItems as CartItem[]).map((item: CartItem) => (
                  <div key={item.itemId} className="flex items-center gap-4 border-b last:border-0 py-3">
                    <img src={item.image ?? 'https://picsum.photos/seed/placeholder/200/200'} alt={item.name} className="w-16 h-16 rounded object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm opacity-70">{formatPrice(item.priceMinor, item.currency)}</p>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQty.mutate({ itemId: item.itemId, quantity: Number(e.target.value) })}
                      className="input input-bordered w-20 input-sm"
                    />
                    <button className="btn btn-ghost btn-sm text-error" onClick={() => remove.mutate(item.itemId)}>Retirer</button>
                  </div>
                ))}
                <p className="text-right font-semibold">
                  Sous-total : {formatPrice((shopItems as CartItem[]).reduce((s: number, i: CartItem) => s + i.priceMinor * i.quantity, 0), (shopItems as CartItem[])[0].currency)}
                </p>
              </div>
            </div>
          ))}

          <div className="card bg-base-100 shadow">
            <div className="card-body flex md:flex-row items-center justify-between gap-4">
              <p className="text-xl font-bold">Total : {formatPrice(cart.data?.totalMinor ?? 0, cart.data?.currency ?? 'XOF')}</p>
              <button className="btn btn-primary btn-lg" onClick={() => checkout.mutate()} disabled={checkout.isPending}>
                {checkout.isPending ? 'Traitement…' : 'Commander (paiement à la livraison)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
