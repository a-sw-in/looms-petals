'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import CartIcon from './CartIcon';

// Simple inline SVG icon components (stroke inherits currentColor)
const Icon = {
  Brand: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 5c2.5 2.3 6.5 2.3 9 0M12 4v16M6 20h12" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Camera: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-2h8l2 2h3a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  Mic: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" />
    </svg>
  ),
  Diamond: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8 7 3h10l4 5-9 13-9-13Z" /><path d="M7 3l5 13L17 3" />
    </svg>
  ),
  Store: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7h18l-2 12H5L3 7Z" /><path d="M16 7l-2-4H10L8 7" />
    </svg>
  ),
  Heart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="7" r="4" /><path d="M5.5 21a8.5 8.5 0 0 1 13 0" />
    </svg>
  ),
  Cart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h3l2.6 12.3A2 2 0 0 0 8.6 15H19a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  ),
  Earrings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="12" r="3" /><path d="M8 9V5" /><circle cx="16" cy="12" r="3" /><path d="M16 9V5" />
    </svg>
  ),
  Ring: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="14" r="6" /><path d="M9 6h6l-2-3h-2l-2 3Z" />
    </svg>
  ),
  Daily: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 3h8l2 4H6l2-4Z" /><rect x="4" y="7" width="16" height="12" rx="2" />
    </svg>
  ),
  Box: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 16V8l-9-5-9 5v8l9 5 9-5Z" /><path d="M3.3 7.3 12 12l8.7-4.7" />
    </svg>
  ),
  Wedding: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 7 9 4h6l-3 3Z" /><circle cx="8" cy="15" r="5" /><circle cx="16" cy="15" r="5" />
    </svg>
  ),
  Gift: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M12 7v14M2 11h20" />
      <path d="M7 7a3 3 0 1 1 6 0H7Zm10 0h-6a3 3 0 1 1 6 0Z" />
    </svg>
  ),
  More: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

export function Navbar() {
  const [active, setActive] = useState('Diamond');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menu = [
    { key: 'Jewellery', icon: <Icon.Diamond />, label: 'Jewellery', href: '/collections/jewellery' },
    { key: 'Clothing', icon: <Icon.Store />, label: 'Clothing', href: '/collections/clothing' },
    { key: 'Saree', icon: <Icon.Store />, label: 'Saree', href: '/collections/saree' },
    { key: 'Lehengas', icon: <Icon.Store />, label: 'Lehengas', href: '/collections/lehengas' },
    { key: 'Men', icon: <Icon.User />, label: 'Men', href: '/collections/men' },
    { key: 'Women', icon: <Icon.User />, label: 'Women', href: '/collections/women' },
    { key: 'Footwear', icon: <Icon.Brand />, label: 'Footwear', href: '/collections/footwear' },
  ];

  const handleMenuClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="tnq-navbar">
      {/* Top Row */}
      <div className="tnq-row tnq-row-top">
        {/* Mobile Menu Toggle */}
        <button
          className="tnq-mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <Icon.Close /> : <Icon.Menu />}
        </button>

        <div className="tnq-brand">
          <Link href="/" className="tnq-brand-link">
            <span className="tnq-brand-text">LOOMS & PETALS</span>
          </Link>
        </div>
        <div className="tnq-row justify-center tnq-row-menu tnq-desktop-menu">
          {menu.map((m) => (
            <button
              key={m.key}
              onClick={() => handleMenuClick(m.href)}
              className={`tnq-menu-item ${pathname === m.href ? 'active' : ''}`}
            >
              <span className="tnq-menu-icon" aria-hidden>{m.icon}</span>
              <span className="tnq-menu-label">{m.label}</span>
            </button>
          ))}
        </div>


        <div className="tnq-nav-actions">
          <CartIcon />
          <div className="tnq-account-wrapper">
            <button
              className="tnq-account-btn tnq-desktop-account"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              <Icon.User />
            </button>
            {showAccountMenu && (
              <div className="tnq-account-menu">
                <div className="tnq-account-menu-header">
                  <p className="tnq-account-name">{user?.name || 'User'}</p>
                  <p className="tnq-account-email">{user?.email}</p>
                </div>
                <div className="tnq-account-menu-items">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setShowAccountMenu(false);
                    }}
                    className="tnq-account-menu-item"
                  >
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/faq');
                      setShowAccountMenu(false);
                    }}
                    className="tnq-account-menu-item"
                  >
                    <span>FAQ & Help</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/orders');
                      setShowAccountMenu(false);
                    }}
                    className="tnq-account-menu-item"
                  >
                    <Icon.Box />
                    <span>My Orders</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      setShowAccountMenu(false);
                    }}
                    className="tnq-account-menu-item tnq-logout"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Mobile Menu Dropdown */}
      <div className={`tnq-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {menu.map((m) => (
          <button
            key={m.key}
            onClick={() => handleMenuClick(m.key)}
            className={`tnq-mobile-menu-item ${active === m.key ? 'active' : ''}`}
          >
            <span className="tnq-menu-icon" aria-hidden>{m.icon}</span>
            <span className="tnq-menu-label">{m.label}</span>
          </button>
        ))}
        {/* Account Button in Mobile Menu */}
        <button
          className="tnq-mobile-menu-item tnq-mobile-account"
          onClick={() => {
            router.push('/profile');
            setMobileMenuOpen(false);
          }}
        >
          <Icon.User />
          <span className="tnq-menu-label">My Account</span>
        </button>
        <button
          className="tnq-mobile-menu-item"
          onClick={() => {
            router.push('/faq');
            setMobileMenuOpen(false);
          }}
        >
          <span className="tnq-menu-label">FAQ & Help</span>
        </button>
        <button
          className="tnq-mobile-menu-item"
          onClick={() => {
            router.push('/orders');
            setMobileMenuOpen(false);
          }}
        >
          <Icon.Box />
          <span className="tnq-menu-label">My Orders</span>
        </button>
        <button
          className="tnq-mobile-menu-item tnq-mobile-logout"
          onClick={async () => {
            await logout();
            setMobileMenuOpen(false);
          }}
        >
          <span className="tnq-menu-icon">🚪</span>
          <span className="tnq-menu-label">Logout</span>
        </button>
      </div>
    </nav>
  );
}
