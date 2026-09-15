import { ArrowRight, BadgeCheck, Heart, Search, ShieldCheck, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Mode', count: '2,1k', icon: '👗' },
  { name: 'Électronique', count: '1,6k', icon: '📱' },
  { name: 'Maison', count: '980', icon: '🏡' },
  { name: 'Beauté', count: '730', icon: '💄' },
  { name: 'Sport', count: '840', icon: '🏋️' },
  { name: 'Accessoires', count: '1,2k', icon: '👜' },
  { name: 'Informatique', count: '1,4k', icon: '💻' },
  { name: 'Téléphones', count: '1,9k', icon: '📲' },
];

const products = [
  {
    id: 'smartphone-xyz',
    name: 'Smartphone XYZ Pro',
    seller: 'Tech Store',
    price: '45 000 FCFA',
    oldPrice: '55 000 FCFA',
    rating: 5,
    reviews: 124,
    badge: '🔥 -20%',
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'airpods-max',
    name: 'AirPods Max Luxe',
    seller: 'Audio House',
    price: '32 000 FCFA',
    oldPrice: '39 000 FCFA',
    rating: 4,
    reviews: 88,
    badge: '⚡ Promo',
    image:
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'watch-elite',
    name: 'Watch Elite 5',
    seller: 'Aster Labs',
    price: '27 500 FCFA',
    oldPrice: '34 000 FCFA',
    rating: 5,
    reviews: 210,
    badge: 'Nouveau',
    image:
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'camera-4k',
    name: 'Caméra 4K Pro',
    seller: 'Lens Atelier',
    price: '68 000 FCFA',
    oldPrice: '82 000 FCFA',
    rating: 4,
    reviews: 57,
    badge: '⭐ Top',
    image:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80',
  },
];

const sellers = [
  { name: 'Nova Living', products: 980, sales: '12,4k', rating: 5, verified: true, accent: '#7c3aed' },
  { name: 'CelloTech', products: 642, sales: '8,9k', rating: 4, verified: true, accent: '#0ea5e9' },
  { name: 'Lumière Studio', products: 420, sales: '6,1k', rating: 5, verified: true, accent: '#f97316' },
];

const stats = [
  { label: 'Vendeurs actifs', value: '9.4k' },
  { label: 'Produits listés', value: '180k+' },
  { label: 'Clients satisfaits', value: '98%' },
  { label: 'Livraison rapide', value: '24h' },
];

const renderStars = (count: number) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star key={index} size={14} className={index < count ? 'star-filled' : 'star-empty'} fill={index < count ? 'currentColor' : 'none'} />
  ));

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero-section page-section">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={16} />
            Marketplace premium • Togo
          </span>
          <h1>Découvrez. Achetez. Vendez.</h1>
          <p>
            Une marketplace moderne qui connecte vendeurs et acheteurs avec une expérience rapide,
            élégante et orientée conversion.
          </p>
          <div className="cta-row">
            <Link to="/products" className="primary-button">
              Explorer les produits
              <ArrowRight size={18} />
            </Link>
            <Link to="/profile" className="secondary-button">
              Devenir vendeur
            </Link>
          </div>
          <div className="hero-trust-row">
            {stats.map((stat) => (
              <div key={stat.label} className="mini-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual">
          <div className="showcase-card main-spotlight">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80"
              alt="Produit phare AuraMarket"
            />
            <div className="floating-badge badge-top">Livraison express</div>
            <div className="floating-card card-left">
              <div className="icon-wrap orange"><ShoppingBag size={16} /></div>
              <div>
                <strong>3 482</strong>
                <span>Commandes aujourd'hui</span>
              </div>
            </div>
            <div className="floating-card card-right">
              <div className="icon-wrap green"><ShieldCheck size={16} /></div>
              <div>
                <strong>4.9/5</strong>
                <span>Évaluation globale</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-section categories-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">Explorer</span>
            <h2>Catégories populaires</h2>
          </div>
          <Link to="/products" className="section-link">Voir tout</Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category.name} to="/products" className="category-card">
              <span className="category-icon">{category.icon}</span>
              <div>
                <strong>{category.name}</strong>
                <small>{category.count} produits</small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">Offres du jour</span>
            <h2>Produits en vedette</h2>
          </div>
          <Link to="/products" className="section-link">Tout voir</Link>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-media">
                <img src={product.image} alt={product.name} loading="lazy" />
                <span className="promo-badge">{product.badge}</span>
                <button type="button" className="favorite-button" aria-label="Ajouter aux favoris">
                  <Heart size={16} />
                </button>
              </div>
              <div className="product-body">
                <div className="rating-line">
                  <div className="stars">{renderStars(product.rating)}</div>
                  <span>({product.reviews})</span>
                </div>
                <h3>{product.name}</h3>
                <div className="price-row">
                  <strong>{product.price}</strong>
                  <span>{product.oldPrice}</span>
                </div>
                <div className="seller-line">
                  <span>Vendu par</span>
                  <strong>{product.seller}</strong>
                </div>
                <Link to={`/product/${product.id}`} className="cart-button">
                  Ajouter au panier
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section sellers-section">
        <div className="section-header">
          <div>
            <span className="section-kicker">Équipe de confiance</span>
            <h2>Découvrez nos vendeurs</h2>
          </div>
          <div className="seller-search">
            <Search size={16} />
            <input type="search" placeholder="Rechercher un vendeur" aria-label="Rechercher un vendeur" />
          </div>
        </div>

        <div className="seller-grid">
          {sellers.map((seller) => (
            <article key={seller.name} className="seller-card">
              <div className="seller-banner" style={{ background: `linear-gradient(135deg, ${seller.accent}, #f8fafc)` }} />
              <div className="seller-content">
                <div className="seller-top-row">
                  <div className="seller-avatar" style={{ background: seller.accent }}>{seller.name.charAt(0)}</div>
                  <div className="seller-meta">
                    <h3>{seller.name}</h3>
                    <div className="seller-rating">
                      {renderStars(seller.rating)}
                      <span>4.9</span>
                    </div>
                  </div>
                  {seller.verified && <span className="verified-pill"><BadgeCheck size={14} /> Vérifié</span>}
                </div>
                <div className="seller-stats">
                  <span>{seller.products} produits</span>
                  <span>{seller.sales} ventes</span>
                </div>
                <Link to="/profile" className="secondary-button seller-button">
                  Voir la boutique
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-section cta-section">
        <div className="cta-panel">
          <div>
            <span className="section-kicker">Pourquoi AuraMarket</span>
            <h2>Une expérience d'achat pensée pour convertir.</h2>
          </div>
          <div className="trust-row">
            <div>
              <strong>100%</strong>
              <span>Vendeurs vérifiés</span>
            </div>
            <div>
              <strong>24h</strong>
              <span>Livraison express</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Support client</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;