import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../api/client';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => listProducts({ page: 0, size: 12 }),
  });

  if (isPending) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Error loading products: {error.message}
      </div>
    );
  }

  const products = data?.content ?? [];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Produits populaires</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.images?.[0] || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h2>
                  <p className="text-gray-500 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex justify-between items-start">
                    <span className="text-xl font-bold">
                      {product.priceMinor / 100} {product.currency}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.stock} en stock
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;