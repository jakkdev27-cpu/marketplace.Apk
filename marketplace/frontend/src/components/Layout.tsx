import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/client';
import { Bell, Heart, Menu, MoonStar, Search, ShoppingCart, Sparkles, SunMedium } from 'lucide-react';

const Layout: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: unreadCount = 0, isPending } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: getUnreadCount,
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-block">
            <NavLink to="/" className="brand-mark" aria-label="AuraMarket home">
              <span className="brand-icon">A</span>
              <span>AuraMarket</span>
            </NavLink>
          </div>

          <div className="header-search-box" role="search">
            <Search size={18} />
            <input
              type="search"
              aria-label="Rechercher un produit, une catégorie ou un vendeur"
              placeholder="Rechercher un produit, une catégorie ou un vendeur..."
            />
          </div>

          <nav className="main-nav" aria-label="Navigation principale">
            <NavLink to="/products" className="nav-link">Boutique</NavLink>
            <NavLink to="/profile" className="nav-link">Compte</NavLink>
            <NavLink to="/notifications" className="nav-link nav-link-icon" aria-label="Notifications">
              <Bell size={18} />
              {!isPending && unreadCount > 0 && <span className="notify-badge">{unreadCount}</span>}
            </NavLink>
            <NavLink to="/profile" className="nav-link nav-link-icon" aria-label="Favoris">
              <Heart size={18} />
            </NavLink>
            <NavLink to="/cart" className="cart-link" aria-label="Panier">
              <ShoppingCart size={18} />
              <span>Panier</span>
              <strong>2</strong>
            </NavLink>
          </nav>

          <div className="header-tools">
            <button
              type="button"
              className="icon-button"
              onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
              aria-label="Basculer le thème"
            >
              {theme === 'light' ? <MoonStar size={18} /> : <SunMedium size={18} />}
            </button>
            <button
              type="button"
              className="mobile-menu"
              aria-label="Ouvrir le menu"
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu-panel" aria-label="Menu mobile">
            <NavLink to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Boutique
            </NavLink>
            <NavLink to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Compte
            </NavLink>
            <NavLink to="/notifications" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Notifications
            </NavLink>
            <NavLink to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Favoris
            </NavLink>
            <NavLink to="/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Panier
            </NavLink>
          </div>
        )}
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <div className="floating-scroll-tag">
        <Sparkles size={16} />
        Livraison rapide à Lomé
      </div>
    </div>
  );
};

export default Layout;
