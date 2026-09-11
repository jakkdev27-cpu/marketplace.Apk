import { Link, NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Store } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const LEGAL_LINKS = [
  { to: '/legal/privacy-policy', label: 'Confidentialité' },
  { to: '/legal/terms', label: 'CGU' },
  { to: '/legal/sales-terms', label: 'Ventes' },
  { to: '/legal/cookie-policy', label: 'Cookies' },
  { to: '/legal/refund-policy', label: 'Remboursements' },
  { to: '/legal/seller-terms', label: 'Vendeurs' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <header className="navbar bg-base-100 shadow-md sticky top-0 z-30">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl gap-2">
            <Store size={22} /> Marketplace
          </Link>
          <nav className="hidden md:flex ml-4">
            <NavLink to="/products" className="btn btn-ghost">Produits</NavLink>
          </nav>
        </div>
        <div className="flex-none gap-2">
          {user ? (
            <>
              <Link to="/cart" className="btn btn-ghost btn-circle" aria-label="Panier">
                <ShoppingCart size={20} />
              </Link>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost">
                  {user.firstName} <span className="badge badge-sm">{user.role}</span>
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                  <li><Link to="/orders">Mes commandes</Link></li>
                  {user.role === 'SELLER' && <li><Link to="/seller">Espace vendeur</Link></li>}
                  <li><button onClick={logout}>Déconnexion</button></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Connexion</Link>
              <Link to="/register" className="btn btn-primary">Inscription</Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="footer footer-center p-6 bg-base-100 text-base-content text-sm gap-2">
        <p>Marketplace — démonstration. Paiement physique, livraison organisée par le vendeur.</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="link link-hover">{link.label}</Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
