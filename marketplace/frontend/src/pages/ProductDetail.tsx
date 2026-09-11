import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { errorMessage, formatPrice } from '../utils/format';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const product = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get<Product>(`/products/${id}`)).data,
    enabled: Boolean(id),
  });

  const addToCart = useMutation({
    mutationFn: async () => api.post('/cart/items', { productId: id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      navigate('/cart');
    },
  });

  if (product.isLoading) return <div className="text-center py-20">Chargement…</div>;
  if (product.isError || !product.data) return <div className="text-center py-20">Produit introuvable.</div>;

  const p = product.data;
  const image = p.images[0] ?? 'https://picsum.photos/seed/placeholder/800/800';

  const handleAdd = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    addToCart.mutate();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <img src={image} alt={p.name} className="w-full rounded-box shadow-lg object-cover" />
        <div>
          <p className="text-sm opacity-70">{p.categoryName ?? 'Sans catégorie'} · {p.shopName}</p>
          <h1 className="text-3xl font-bold mt-1">{p.name}</h1>
          {p.reference && <p className="text-sm opacity-60 mt-1">Réf : {p.reference}</p>}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(p.priceMinor, p.currency)}</span>
            {p.oldPriceMinor != null && p.oldPriceMinor > p.priceMinor && (
              <span className="text-xl line-through opacity-60">{formatPrice(p.oldPriceMinor, p.currency)}</span>
            )}
          </div>
          <p className="mt-2">
            {p.stock > 0
              ? <span className="badge badge-success">{p.stock} en stock</span>
              : <span className="badge badge-neutral">Rupture de stock</span>}
          </p>
          {p.description && <p className="mt-4 whitespace-pre-line">{p.description}</p>}

          {addToCart.isError && <div className="alert alert-error text-sm mt-4">{errorMessage(addToCart.error)}</div>}

          {p.stock > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={p.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(p.stock, Number(e.target.value))))}
                className="input input-bordered w-24"
              />
              <button className="btn btn-primary" onClick={handleAdd} disabled={addToCart.isPending}>
                {addToCart.isPending ? 'Ajout…' : 'Ajouter au panier'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
