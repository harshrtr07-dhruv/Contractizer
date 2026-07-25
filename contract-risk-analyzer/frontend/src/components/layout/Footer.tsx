import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterProps {
  links?: FooterLink[];
}

export const Footer: React.FC<FooterProps> = ({ links = [] }) => {
  const navigate = useNavigate();

  const handleClick = (href: string, e: React.MouseEvent) => {
    if (href.startsWith('http') || href.startsWith('mailto')) return;
    e.preventDefault();
    navigate(href);
  };

  const navLinks = links.length > 0 ? links : [
    { label: 'Privacy Protocol', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'System Status',    href: '/status' },
  ];

  return (
    <footer
      className="w-full flex flex-col items-center gap-6 py-10"
      style={{
        backgroundColor: 'var(--color-paper,#FFFFFF)',
        borderTop: '2px solid rgba(43,43,43,0.12)',
      }}
    >
      {/* Links row */}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {navLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            onClick={(e) => handleClick(link.href, e)}
            className="nav-link"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Divider */}
      <div
        className="w-[40px] h-[2px]"
        style={{ backgroundColor: 'rgba(43,43,43,0.15)' }}
      />

      {/* Copyright */}
      <span
        className="text-[11px] uppercase font-extrabold opacity-35 tracking-[0.12em] text-center px-4"
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          color: 'var(--color-ink,#2B2B2B)',
        }}
      >
        © {new Date().getFullYear()} Contractizer · harshrtr_07 · All Rights Reserved
      </span>
    </footer>
  );
};

export default Footer;
