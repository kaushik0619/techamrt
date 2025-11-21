import { Instagram, Send } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/api';
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

interface FooterProps {
  onNavigate: (page: string, category?: string) => void;
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      await api.post('/api/misc/newsletter', { email });
      setSubmitted(true);
    } catch (err) {
      console.error('Newsletter subscribe failed', err);
      alert('Failed to subscribe. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <div className="text-sm text-green-400">Subscribed — check your email for confirmation.</div>;
  }

  return (
    <form className="flex" onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Enter your email"
        className="w-full bg-neutral-800 border border-neutral-700 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
      />
      <button type="submit" disabled={isSubmitting} className="btn-brand p-2 rounded-r-md">
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#000000] text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"> 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <img src="/logo.png" alt="Logo" className="h-12 mb-4" />
            <p className="text-neutral-400 text-sm">
              Your one-stop shop for the latest accessories, spare parts, and gadgets at prices that make sense.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('shop', 'accessories')} className="text-neutral-400 hover:text-white transition-colors text-sm">Accessories</button></li>
              <li><button onClick={() => onNavigate('shop', 'spare_parts')} className="text-neutral-400 hover:text-white transition-colors text-sm">Spare Parts</button></li>
              <li><button onClick={() => onNavigate('shop', 'toys_games')} className="text-neutral-400 hover:text-white transition-colors text-sm">Toys & Games</button></li>
              <li><button onClick={() => onNavigate('shop', 'car_accessories')} className="text-neutral-400 hover:text-white transition-colors text-sm">Car Accessories</button></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
            <li><button onClick={() => onNavigate('contact')} className="text-neutral-400 hover:text-white transition-colors text-sm">Contact Us</button></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="font-semibold mb-4">Join Our Newsletter</h3>
            <p className="text-neutral-400 text-sm mb-4">Get weekly updates on new arrivals and special promotions.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} ABC. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="https://www.instagram.com/accessoriesbutcheaper?igsh=aXk2dzVkanpkOTd4" className="text-neutral-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
 <a
    href="https://wa.me/9311216285"
    className="text-neutral-400 hover:text-white transition-colors"
  >
    <FaWhatsapp className="w-5 h-5" />
  </a>

  <a
    href="https://t.me/Accessoriesbutcheaper"
    className="text-neutral-400 hover:text-white transition-colors"
  >
    <FaTelegramPlane className="w-5 h-5" />
  </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
