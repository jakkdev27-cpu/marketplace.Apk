import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProduct } from '../api/client';
import { follow, unfollow, getFollowing } from '../api/client';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BellPlus, Bell } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: product, isPending: productPending, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  const { data: followings = [], isPending: followingPending } = useQuery({
    queryKey: ['followings'],
    queryFn: () => getFollowing(),
  });

  const isPending = productPending || followingPending;
  // Assuming followings is an array of user objects with an 'id' field
  const isFollowing = followings.some((f) => f.id === product.shopId);

  const handleFollow = async () => {
    if (!product) return;
    try {
      if (isFollowing) {
        await unfollow(product.shopId);
      } else {
        await follow(product.shopId);
      }
      // Refetch followings to update state
      await queryClient.invalidateQueries({ queryKey: ['followings'] });
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (isPending) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (productError || !product) {
    return (
      <div className="text-center py-12">
        {productError ? (
          <p className="text-red-500">Error loading product: {productError.message}</p>
        ) : (
          <p>Product not found</p>
        )}
        <Link to="/" className="mt-4 inline-block text-blue-500 hover:underline">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col lg:flex-row">
          <div class="w-full lg:w-1/2">
            <img
              src={product.images?.[0] || '/placeholder.png'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div class="w-full lg:w-1/2 lg:pl-8 pt-4 lg:pt-0">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="mb-4">
              <span className="text-blue-600">{product.shopName}</span>
            </div>
            <p className="text-gray-600 mb-6 line-clamp-4">{product.description}</p>
            <div className="flex items-baseline mb-6">
              <span className="text-2xl font-bold mr-2">
                {product.priceMinor / 100} {product.currency}
              </span>
              {product.oldPriceMinor ? (
                <span className="text-lg line-through text-gray-400 ml-2">
                  {product.oldPriceMinor / 100} {product.currency}
                </span>
              ) : null}
            </div>
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Stock: {product.stock} disponible(s)
              </span>
            </div>
            <div className="mb-6">
              <button
                onClick={handleFollow}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                  isFollowing
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Bell className="mr-2 h-5 w-5" />
                    Ne plus suivre
                  </>
                ) : (
                  <>
                    <BellPlus className="mr-2 h-5 w-5" />
                    Suivre le vendeur
                  </>
                )}
              </button>
            </div>
            <Link to="/" className="inline-flex items-center text-sm text-blue-500 hover:underline">
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;