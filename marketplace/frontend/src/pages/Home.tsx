import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '../types';

interface Paged<T> { content: T[]; }

export default function Home() {
  const products = useQuery({
    queryKey: ['products', 'latest'],
    queryFn: async () => (await api.get<Paged<Product>>('/products', { params: { size: 8, sort: 'createdAt,desc' } })).data,
  });
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  return (
    <div>
      <section className="hero bg-primary text-primary-content py-16">
        <div className="hero-content text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">La marketplace locale qui grandit avec vous</h1>
            <p className="py-6">Achetez auprès de vendeurs locaux, ou ouvrez votre boutique en quelques minutes.</p>
            <div className="flex justify-center gap-3">
              <Link to="/products" className="btn btn-secondary">Découvrir le catalogue</Link>
              <Link to="/register" className="btn btn-outline btn-accent">Devenir vendeur</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold mb-4">Catégories</h2>
        <div className="flex flex-wrap gap-2">
          {(categories.data ?? []).map((c) => (
            <Link key={c.id} to={`/products?categoryId=${c.id}`} className="btn btn-outline btn-sm">{c.name}</Link>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold mb-4">Nouveautés</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(products.data?.content ?? []).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
