import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { errorMessage, formatPrice } from '../utils/format';
import type { Category, Product, Shop } from '../types';

interface Paged<T> { content: T[]; }

const EMPTY_PRODUCT = { name: '', description: '', priceMinor: 0, stock: 0, categoryId: '', reference: '', imageUrl: '' };

export default function SellerDashboard() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [shopForm, setShopForm] = useState({ name: '', description: '', slogan: '', phone: '', email: '', address: '' });
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);

  const shop = useQuery({
    queryKey: ['seller', 'shop'],
    queryFn: async () => (await api.get<Shop>('/seller/shop')).data,
    retry: false,
  });

  const products = useQuery({
    queryKey: ['seller', 'products'],
    queryFn: async () => (await api.get<Paged<Product>>('/seller/products', { params: { size: 50 } })).data,
  });

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const saveShop = useMutation({
    mutationFn: () => api.put('/seller/shop', shopForm),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'shop'] }),
    onError: (err) => setError(errorMessage(err)),
  });

  const saveProduct = useMutation({
    mutationFn: () =>
      api.post('/products', {
        name: productForm.name,
        description: productForm.description,
        priceMinor: Math.round(Number(productForm.priceMinor) * 100),
        stock: Number(productForm.stock),
        categoryId: productForm.categoryId || null,
        reference: productForm.reference || null,
        images: productForm.imageUrl ? [productForm.imageUrl] : [],
      }),
    onSuccess: () => {
      setProductForm(EMPTY_PRODUCT);
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] });
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const updateStock = useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) => {
      const product = products.data?.content.find((p) => p.id === id);
      return api.put(`/products/${id}`, {
        name: product!.name,
        description: product!.description ?? '',
        priceMinor: product!.priceMinor,
        stock,
        categoryId: product!.categoryId ?? null,
        reference: product!.reference ?? null,
        images: product!.images,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller', 'products'] }),
    onError: (err) => setError(errorMessage(err)),
  });

  const onShopSubmit = (e: FormEvent) => { e.preventDefault(); setError(null); saveShop.mutate(); };
  const onProductSubmit = (e: FormEvent) => { e.preventDefault(); setError(null); saveProduct.mutate(); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Espace vendeur</h1>
      {error && <div className="alert alert-error text-sm">{error}</div>}

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Ma boutique {shop.data && <span className="badge badge-success">active</span>}</h2>
          {shop.isError && <p className="text-sm opacity-70">Vous n'avez pas encore de boutique — remplissez ce formulaire pour la créer.</p>}
          <form onSubmit={onShopSubmit} className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Nom de la boutique" className="input input-bordered" value={shopForm.name} onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })} />
            <input placeholder="Slogan" className="input input-bordered" value={shopForm.slogan} onChange={(e) => setShopForm({ ...shopForm, slogan: e.target.value })} />
            <input placeholder="Téléphone" className="input input-bordered" value={shopForm.phone} onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })} />
            <input placeholder="Email de contact" className="input input-bordered" value={shopForm.email} onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })} />
            <input placeholder="Adresse" className="input input-bordered md:col-span-2" value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} />
            <textarea placeholder="Description" className="textarea textarea-bordered md:col-span-2" value={shopForm.description} onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })} />
            <button className="btn btn-primary md:col-span-2" disabled={saveShop.isPending}>{shop.data ? 'Mettre à jour' : 'Créer ma boutique'}</button>
          </form>
        </div>
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Ajouter un produit</h2>
          <p className="text-sm opacity-70">Prix en FCFA (entier) — stocké en unités mineures côté serveur.</p>
          <form onSubmit={onProductSubmit} className="grid md:grid-cols-2 gap-3">
            <input required placeholder="Nom du produit" className="input input-bordered" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
            <input required type="number" min={0} placeholder="Prix (FCFA)" className="input input-bordered" value={productForm.priceMinor || ''} onChange={(e) => setProductForm({ ...productForm, priceMinor: Number(e.target.value) })} />
            <input required type="number" min={0} placeholder="Stock" className="input input-bordered" value={productForm.stock || ''} onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })} />
            <input placeholder="Référence" className="input input-bordered" value={productForm.reference} onChange={(e) => setProductForm({ ...productForm, reference: e.target.value })} />
            <select className="select select-bordered" value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>
              <option value="">Catégorie…</option>
              {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="URL de l'image" className="input input-bordered" value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} />
            <textarea placeholder="Description" className="textarea textarea-bordered md:col-span-2" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            <button className="btn btn-primary md:col-span-2" disabled={saveProduct.isPending}>Publier le produit</button>
          </form>
        </div>
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Mes produits ({products.data?.content.length ?? 0})</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr><th>Nom</th><th>Prix</th><th>Stock</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {(products.data?.content ?? []).map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{formatPrice(p.priceMinor, p.currency)}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        className="input input-bordered input-sm w-24"
                        defaultValue={p.stock}
                        onBlur={(e) => {
                          const stock = Number(e.target.value);
                          if (stock !== p.stock) updateStock.mutate({ id: p.id, stock });
                        }}
                      />
                    </td>
                    <td><span className="badge">{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
