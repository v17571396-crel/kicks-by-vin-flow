import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { favoriteIds } = useFavorites();
  const count = user ? favoriteIds.length : 0;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground">
          Kicks<span className="text-terracotta">by</span>Vin
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link to="/about" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
          <a
            href="https://wa.me/254751687034?text=Hey%20KicksbyVin!%20I%20have%20a%20question"
            target="_blank"
            rel="noopener noreferrer"
            className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </a>
          <Link to="/wishlist" className="relative font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <Heart size={18} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-terracotta text-accent-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </Link>
          <Link to="/admin" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-background border-b border-border"
          >
            <div className="flex flex-col gap-4 p-4">
              <Link to="/" onClick={() => setIsOpen(false)} className="font-body text-base font-medium text-foreground py-2">
                Shop
              </Link>
              <Link to="/about" onClick={() => setIsOpen(false)} className="font-body text-base font-medium text-foreground py-2">
                About
              </Link>
              <a
                href="https://wa.me/254751687034?text=Hey%20KicksbyVin!%20I%20have%20a%20question"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-base font-medium text-foreground py-2"
              >
                Contact via WhatsApp
              </a>
              <Link to="/wishlist" onClick={() => setIsOpen(false)} className="font-body text-base font-medium text-foreground py-2">
                ♥ Wishlist
              </Link>
              <Link to="/admin" onClick={() => setIsOpen(false)} className="font-body text-base font-medium text-foreground py-2">
                Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
