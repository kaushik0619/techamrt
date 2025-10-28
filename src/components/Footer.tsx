import { Instagram, Send } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <img src="/logo-light.png" alt="Logo" className="h-12 mb-4" />
            <p className="text-neutral-400 text-sm">
              Your one-stop shop for the latest accessories, spare parts, and gadgets at prices that make sense.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Accessories</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Spare Parts</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Toys & Games</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Car Accessories</a></li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Contact Us</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div>
            <h3 className="font-semibold mb-4">Join Our Newsletter</h3>
            <p className="text-neutral-400 text-sm mb-4">Get weekly updates on new arrivals and special promotions.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT"
              />
              <button type="submit" className="bg-primary-DEFAULT hover:bg-primary-hover p-2 rounded-r-md">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">&copy; {new Date().getFullYear()} ABC. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="https://www.instagram.com/accessoriesbutcheaper?igsh=aXk2dzVkanpkOTd4" className="text-neutral-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors"><WhatsAppIcon /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
