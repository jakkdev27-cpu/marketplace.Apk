import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Search, Sparkles, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import type { Category, Product } from '../types';

interface Paged<T> {
  content: T[];
  totalPages: number;
  number: number;
}

const quickFilters = ['Tout', 'Mode', 'Électronique', 'Maison', 'Beauté', 'Téléphones'];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchText, setSearchText] = useState(params.get('q') ?? '');
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

  const activeCategory = useMemo(
    () => (categories.data ?? []).find((category: Category) => category.id === categoryId),
    [categories.data, categoryId]
  );

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const clearSearch = () => {
    const next = new URLSearchParams(params);
    next.delete('q');
    setSearchText('');
    setParams(next);
  };

  const handleSearchSubmit = (value: string) => {
    const trimmed = value.trim();
    setSearchText(trimmed);
    update('q', trimmed);
  };

  return (
    <div className="catalog-page page-section">
      <div className="catalog-header">
        <div>
          <span className="section-kicker">
            <Sparkles size={14} />
            Catalogue premium
          </span>
          <h1>Découvrez des produits inspirants</h1>
        </div>
      </div>

      <div className="catalog-toolbar">
        <div className="catalog-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Rechercher un produit, une catégorie ou un vendeur..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearchSubmit((event.target as HTMLInputElement).value);
              }
            }}
            aria-label="Rechercher dans le catalogue"
          />
          {q && (
            <button type="button" className="clear-search" onClick={clearSearch} aria-label="Effacer la recherche">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="catalog-actions">
          <button
            type="button"
            className="category-dropdown-trigger"
            onClick={() => setShowCategoryMenu((current) => !current)}
            aria-expanded={showCategoryMenu}
            aria-label="Filtrer par catégorie"
          >
            <span>{activeCategory?.name ?? 'Toutes les catégories'}</span>
            <ChevronDown size={16} />
          </button>

          {showCategoryMenu && (
            <div className="category-dropdown-menu" role="menu" aria-label="Choisir une catégorie">
              <button
                type="button"
                className={`category-option ${!categoryId ? 'selected' : ''}`}
                onClick={() => {
                  update('categoryId', '');
                  setShowCategoryMenu(false);
                }}
              >
                Toutes les catégories
              </button>
              {(categories.data ?? []).map((category: Category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`category-option ${categoryId === category.id ? 'selected' : ''}`}
                  onClick={() => {
                    update('categoryId', category.id);
                    setShowCategoryMenu(false);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="filter-pills" aria-label="Filtres rapides">
        {quickFilters.map((filter) => {
          const active = !categoryId && filter === 'Tout';
          return (
            <button
              key={filter}
              type="button"
              className={`filter-pill ${active ? 'active' : ''}`}
              onClick={() => {
                if (filter === 'Tout') {
                  update('categoryId', '');
                  return;
                }
                const matched = (categories.data ?? []).find(
                  (category: Category) => category.name.toLowerCase() === filter.toLowerCase()
                );
                if (matched) update('categoryId', matched.id);
              }}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="catalog-summary">
        <span>{products.data?.content.length ?? 0} produits</span>
        <span>{q ? `Résultats pour “${q}”` : 'Sélection recommandée'}</span>
      </div>

      <div className="product-grid catalogue-grid">
        {(products.data?.content ?? []).map((product: Product) => <ProductCard key={product.id} product={product} />)}
      </div>

      {products.data && products.data.content.length === 0 && (
        <div className="empty-state">
          <p>Aucun produit ne correspond à votre recherche.</p>
          <button type="button" className="secondary-button" onClick={clearSearch}>
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {products.data && products.data.totalPages > 1 && (
        <div className="catalog-pagination">
          <button className="secondary-button" disabled={page === 0} onClick={() => update('page', String(page - 1))}>
            Précédent
          </button>
          <span className="pagination-indicator">
            {page + 1} / {products.data.totalPages}
          </span>
          <button className="secondary-button" disabled={page >= products.data.totalPages - 1} onClick={() => update('page', String(page + 1))}>
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
