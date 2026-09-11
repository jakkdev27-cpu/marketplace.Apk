import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product }: { product: Product }) {
  const image = product.images[0] ?? 'https://picsum.photos/seed/placeholder/800/800';
  const promo = product.oldPriceMinor != null && product.oldPriceMinor > product.priceMinor;
  return (
    <Link to={`/products/${product.id}`} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
      <figure className="relative">
        <img src={image} alt={product.name} className="h-48 w-full object-cover" loading="lazy" />
        {promo && <span className="badge badge-error absolute top-2 left-2">Promo</span>}
        {product.stock === 0 && <span className="badge badge-neutral absolute top-2 right-2">Rupture</span>}
      </figure>
      <div className="card-body p-4">
        <h3 className="card-title text-base line-clamp-1">{product.name}</h3>
        <p className="text-sm opacity-70 line-clamp-1">{product.shopName}</p>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-primary">{formatPrice(product.priceMinor, product.currency)}</span>
          {promo && <span className="text-sm line-through opacity-60">{formatPrice(product.oldPriceMinor!, product.currency)}</span>}
        </div>
      </div>
    </Link>
  );
}
