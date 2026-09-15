import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '../types';

interface Paged<T> {
  content: T[];
  totalPages: number;
  number: number;
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const categoryId = params.get('categoryId') ?? '';
  const page = Number(params.get('page') ?? 0);

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const products = useQuery({
    queryKey: ['products', q, categoryId, page],
    queryFn: async () =>
      (await api.get<Paged<Product>>('/products', {
        params: { q: q || undefined, categoryId: categoryId || undefined, page, size: 12 },
      })).data,
  });

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Catalogue</h1>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          className="input input-bordered flex-1"
          placeholder="Rechercher un produit…"
          defaultValue={q}
          onKeyDown={(e) => { if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value); }}
        />
        <select className="select select-bordered" value={categoryId} onChange={(e) => update('categoryId', e.target.value)}>
          <option value="">Toutes les catégories</option>
          {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(products.data?.content ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>

      {products.data && products.data.content.length === 0 && (
        <p className="text-center py-10 opacity-70">Aucun produit ne correspond à votre recherche.</p>
      )}

      {products.data && products.data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button className="btn btn-sm" disabled={page === 0} onClick={() => update('page', String(page - 1))}>Précédent</button>
          <span className="btn btn-sm btn-disabled">{page + 1} / {products.data.totalPages}</span>
          <button className="btn btn-sm" disabled={page >= products.data.totalPages - 1} onClick={() => update('page', String(page + 1))}>Suivant</button>
        </div>
      )}
    </div>
  );
}
