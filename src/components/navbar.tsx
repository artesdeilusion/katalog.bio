import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from "lucide-react";

const menuItems = [
  { label: 'Özellikler', href: '#ozellikler', expandable: false },
  { label: 'SSS', href: '#sss' },
  { label: 'Giriş Yap', href: '/login' },
  { label: 'Kayıt Ol', href: '/register' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (href.startsWith('/')) {
      // Handle page navigation
      router.push(href);
    }
  };

  return (
    <nav className="bg-background text-foreground border-b border-border sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4  ">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex   items-center">
            <Link className='flex items-center'  href="/">
            <div className="bg-primary rounded-lg w-9 h-9 flex items-center justify-center mr-2 min-w-9">
              <img src="/logo_light.svg" alt="Logo" width={28} height={28} />
            </div>
              <span className="font-bold text-xl tracking-tight text-foreground">katalog.bio</span>
            </Link>
          </div>
          {/* Desktop Nav */}

<div className='flex  '>
<div className=" hidden  md:flex space-x-4 pr-4 items-center">
            <button onClick={() => handleNavClick('#ozellikler')} className="hover:text-muted-foreground transition-colors">Özellikler</button>
            <button onClick={() => handleNavClick('#sss')} className="hover:text-muted-foreground transition-colors">SSS</button>
           </div>

           <div className="hidden  md:flex space-x-4 items-center">
            <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 font-bold rounded-lg hover:bg-primary/90 transition-colors">Giriş Yap</Link>
            <Link href="/register" className="bg-secondary text-secondary-foreground px-4 py-2 font-bold rounded-lg hover:bg-secondary/80 transition-colors">Kayıt Ol</Link>

           </div>
</div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
          <div className=" pr-2   md:flex space-x-4 items-center">
           <Link href="/login" className="bg-primary text-primary-foreground px-4 py-2 font-bold rounded-lg hover:bg-primary/90 transition-colors">Giriş Yap</Link>
 
           </div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-controls="mobile-menu"
              aria-expanded={menuOpen}
            >
                 {menuOpen ? (
                    <Menu className="h-6 w-6" />
                ) : (
                    <Menu className="h-6 w-6" />
                )}
             </button>
             
          </div>
        </div>
      </div>
      {/* Mobile Nav Drawer with animation */}
      <div className="relative z-50">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        {/* Fullscreen Drawer */}
        <div
          className={`fixed inset-0 h-full w-full bg-background text-foreground shadow-lg transform transition-transform duration-300 md:hidden flex flex-col ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ zIndex: 60 }}
        >
          <div className="flex justify-end items-center p-4 border-b border-border">
             <div className="flex items-center gap-2">
               <button
                className="p-2 rounded-md text-foreground hover:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 flex flex-col pt-2">
            {menuItems.map((item, idx) => (
              <React.Fragment key={item.label}>
                <button
                  onClick={() => handleNavClick(item.href)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left text-2xl font-bold text-foreground hover:bg-accent focus:outline-none"
                  style={{ fontFamily: 'inherit' }}
                >
                  {item.label}
                  {item.expandable && (
                    <svg className="h-6 w-6 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                {idx < menuItems.length - 1 && (
                  <div className="border-t border-border mx-6" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
