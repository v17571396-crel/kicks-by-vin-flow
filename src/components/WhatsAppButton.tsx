import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  productTitle?: string;
}

const WhatsAppButton = ({ productTitle }: WhatsAppButtonProps) => {
  const message = productTitle
    ? `Hey KicksbyVin! I'm interested in: ${productTitle}. Can I get more photos?`
    : `Hey KicksbyVin! I have a question about your shoes.`;

  const url = `https://wa.me/254751687034?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 font-body text-sm font-medium"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;
