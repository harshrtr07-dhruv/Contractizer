import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PilotBadge } from '../hud/PilotBadge';
import { HudButton } from '../hud/HudButton';
import { ConfirmModal } from '../ui/ConfirmModal';

export interface NavLink {
  label: string;
  href: string;
}

export interface User {
  name: string;
  photoUrl?: string;
  role: string;
}

export interface NavbarProps {
  user?: User;
  navLinks?: NavLink[];
  isAuthed?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  navLinks = [],
  isAuthed = false,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleNav = (href: string, e: React.MouseEvent) => {
    // Hash anchors scroll in-page; real paths use router
    if (href.startsWith('#')) return;
    e.preventDefault();
    navigate(href);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <nav
        className="w-full flex items-center justify-between px-6 py-4 sticky top-0 z-50"
        style={{
          backgroundColor: 'var(--color-paper, #FFFFFF)',
          borderBottom: '2px solid rgba(43,43,43,0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Left: Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-[10px] bg-transparent border-none p-0 cursor-pointer"
          style={{ transform: 'none', boxShadow: 'none' }}
        >
          <div
            className="w-[8px] h-[8px] rounded-[2px] shrink-0"
            style={{ backgroundColor: 'var(--color-ink, #2B2B2B)' }}
          />
          <span
            className="font-extrabold text-[17px] tracking-tight"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              color: 'var(--color-ink, #2B2B2B)',
              letterSpacing: '-0.02em',
            }}
          >
            CONTRACTIZER
          </span>
        </button>

        {/* Center: Nav Links */}
        <div className="flex items-center gap-8 ml-auto mr-8 hidden md:flex">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={(e) => handleNav(link.href, e)}
              className="nav-link"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Auth or PilotBadge */}
        <div className="flex items-center gap-6 shrink-0">
          {isAuthed && user ? (
            <div className="relative group cursor-pointer" onClick={() => setIsLogoutModalOpen(true)}>
              <PilotBadge
                name={user.name || user.email || 'Unknown'}
                photoUrl={user.photoUrl}
                role={user.role || 'ADMIN'}
              />
            </div>
          ) : (
            <>
              <a
                href="/login"
                onClick={(e) => { e.preventDefault(); navigate('/login'); }}
                className="nav-link hidden sm:block"
              >
                Sign in
              </a>
              <HudButton variant="primary" size="sm" onClick={() => navigate('/register')}>
                REQUEST ACCESS
              </HudButton>
            </>
          )}
        </div>
      </nav>
      
      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="LOGOUT PROTOCOL"
        message="Do you want to log out of Contractizer?"
        confirmText="LOGOUT"
        cancelText="ABORT"
      />
    </>
  );
};

export default Navbar;
