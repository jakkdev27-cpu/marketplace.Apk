import { ArrowLeft, BadgeCheck, Heart, Minus, Plus, ShieldCheck, ShoppingBag, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const productCatalog: Record<string, any> = {
  'smartphone-xyz': {
    id: 'smartphone-xyz',
    name: 'Smartphone XYZ Pro',
    seller: 'Tech Store',
    price: '45 000 FCFA',
    oldPrice: '55 000 FCFA',
    rating: 5,
    reviews: 124,
    stock: 'En stock',
    badge: '🔥 -20%',
    description:
      'Appareil premium pensé pour les créateurs et les professionnels, avec écran AMOLED, batterie longue durée et appareil photo triplé.',
    gallery: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    ],
    features: ['Écran 6.7" OLED', '128 Go + 8 Go RAM', 'Caméra 108 MP', 'Charge rapide 65W'],
    colors: ['Noir cosmic', 'Bleu aube', 'Blanc glacier'],
  },
  'airpods-max': {
    id: 'airpods-max',
    name: 'AirPods Max Luxe',
    seller: 'Audio House',
    price: '32 000 FCFA',
    oldPrice: '39 000 FCFA',
    rating: 4,
    reviews: 88,
    stock: '3 disponibles',
    badge: '⚡ Promo',
    description:
      'Casque over-ear ultra confortable, son immersif et réduction de bruit active pour une expérience audio exceptionnelle.',
    gallery: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    ],
    features: ['Son spatial', 'Réseau Bluetooth 5.3', '30h autonomie', 'NFC / connexion rapide'],
    colors: ['Noir', 'Blanc', 'Gris sidéral'],
  },
};

const similarProducts = [
  { id: 'watch-elite', name: 'Watch Elite 5', price: '27 500 FCFA', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80' },
  { id: 'camera-4k', name: 'Caméra 4K Pro', price: '68 000 FCFA', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80' },
  { id: 'speaker-neo', name: 'Speaker Neo', price: '18 900 FCFA', image: 'https://images.unsplash.com/photo-1543807084-5f0df8a6d6a1?auto=format&fit=crop&w=900&q=80' },
];

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const product = productCatalog[id ?? 'smartphone-xyz'] ?? productCatalog['smartphone-xyz'];

  return (
    <div className="page-section product-detail-page">
      <div className="section-backlink">
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} />
          Retour au catalogue
        </Link>
      </div>

      <div className="detail-layout">
        <div className="gallery-panel">
          <div className="gallery-main">
            <img src={product.gallery[0]} alt={product.name} />
          </div>
          <div className="gallery-thumbs">
            {product.gallery.map((image: string) => (
              <button key={image} type="button" className="thumb-button">
                <img src={image} alt={product.name} />
              </button>
            ))}
          </div>
        </div>

        <div className="detail-panel">
          <div className="detail-top-row">
            <span className="promo-badge detail-badge">{product.badge}</span>
            <button type="button" className="icon-button light" aria-label="Ajouter aux favoris">
              <Heart size={18} />
            </button>
          </div>

          <h1>{product.name}</h1>

          <div className="detail-rating-line">
            <div className="stars">{Array.from({ length: 5 }, (_, index) => (<Star key={index} size={15} className={index < product.rating ? 'star-filled' : 'star-empty'} fill={index < product.rating ? 'currentColor' : 'none'} />))}</div>
            <span>{product.reviews} avis</span>
            <span className="verified-seller"><BadgeCheck size={15} /> Vendeur vérifié</span>
          </div>

          <div className="price-block">
            <strong>{product.price}</strong>
            <span>{product.oldPrice}</span>
          </div>

          <div className="stock-row">
            <ShieldCheck size={16} />
            <span>{product.stock}</span>
          </div>

          <p className="product-description">{product.description}</p>

          <div className="variant-block">
            <label>Couleur</label>
            <div className="variant-list">
              {product.colors.map((color: string) => (
                <button key={color} type="button" className="variant-pill">{color}</button>
              ))}
            </div>
          </div>

          <div className="purchase-row">
            <div className="quantity-picker" aria-label="Quantité">
              <button type="button"><Minus size={16} /></button>
              <span>1</span>
              <button type="button"><Plus size={16} /></button>
            </div>
            <button type="button" className="primary-button large-button">
              <ShoppingBag size={18} />
              Ajouter au panier
            </button>
          </div>

          <div className="cta-row detail-actions">
            <button type="button" className="primary-button large-button">Acheter maintenant</button>
            <button type="button" className="secondary-button large-button">Contacter le vendeur</button>
          </div>
        </div>
      </div>

      <div className="detail-sections">
        <div className="info-block">
          <h3>Description détaillée</h3>
          <p>
            Conçu pour offrir une expérience premium dans le quotidien, ce produit associe performance,
            élégance et fiabilité pour les commandes, les loisirs et le travail mobile.
          </p>
        </div>

        <div className="info-block">
          <h3>Caractéristiques</h3>
          <ul>
            {product.features.map((feature: string) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="info-block">
          <h3>Avis clients</h3>
          <div className="review-card">
            <div className="review-header">
              <strong>Excellent produit, livraison rapide.</strong>
              <span>⭐⭐⭐⭐⭐</span>
            </div>
            <p>Très satisfait : emballage soigné, qualité conforme à la description et service client réactif.</p>
          </div>
        </div>
      </div>

      <div className="similar-section">
        <div className="section-header compact-header">
          <div>
            <span className="section-kicker">Complétez votre achat</span>
            <h2>Produits similaires</h2>
          </div>
        </div>
        <div className="similar-grid">
          {similarProducts.map((item) => (
            <Link key={item.id} to={`/product/${item.id}`} className="similar-card">
              <img src={item.image} alt={item.name} />
              <div>
                <h3>{item.name}</h3>
                <strong>{item.price}</strong>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;