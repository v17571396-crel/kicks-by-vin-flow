const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold mb-3">
              Kicks<span className="text-terracotta-light">by</span>Vin
            </h3>
            <p className="font-body text-sm opacity-80 leading-relaxed">
              Nairobi's trusted source for quality second-hand kicks. Every pair is inspected, cleaned, and priced to keep your style fresh without breaking the bank.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 font-body text-sm opacity-80">
              <li><a href="/" className="hover:opacity-100 transition-opacity">Shop All</a></li>
              <li><a href="https://wa.me/254751687034" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">WhatsApp Us</a></li>
              <li><a href="https://instagram.com/kicksbyvin" target="_blank" rel="noopener noreferrer" className="hover:opacity-100 transition-opacity">Instagram</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Delivery Info</h4>
            <p className="font-body text-sm opacity-80 leading-relaxed">
              We deliver within Nairobi and its environs. Delivery charges apply based on your area. Payment is via M-Pesa only.
            </p>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-primary-foreground/20 text-center">
          <p className="font-body text-xs opacity-60">© 2026 KicksbyVin. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
