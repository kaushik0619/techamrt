import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface LandingProps {
  onNavigate: (page: string) => void;
  onSelectProduct: (id: string) => void;
}

const slides = [
  {
    title: 'Deal of the Day',
    subtitle: 'Unbeatable prices on our top-rated gadgets. Don\'t miss out on these limited-time offers!',
    image: 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    buttonText: 'Explore Deals',
    buttonLink: 'deals',
  },
  {
    title: 'Premium Back Covers',
    subtitle: 'Style meets protection. Discover our new collection of premium cases for all your devices.',
    image: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    buttonText: 'Shop Covers',
    buttonLink: 'shop',
  },
  {
    title: 'Ultimate Car Accessories',
    subtitle: 'Upgrade your ride with the latest in-car technology and accessories for a smarter drive.',
    image: 'https://images.pexels.com/photos/3807378/pexels-photo-3807378.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    buttonText: 'View Collection',
    buttonLink: 'shop',
  },
];

const categories = [
  { name: 'Electronics', image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg' },
  { name: 'Car Accessories', image: 'https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg' },
  { name: 'Gadgets', image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg' },
  { name: 'Special Offers', image: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg' },
];

const mockFeaturedProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones',
    price: 249.99,
    images: ['https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '2',
    name: 'Smartwatch with Fitness Tracker',
    price: 199.00,
    images: ['https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '3',
    name: 'Portable Bluetooth Speaker',
    price: 89.50,
    images: ['https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '4',
    name: '4K Action Camera',
    price: 150.00,
    images: ['https://images.pexels.com/photos/3062946/pexels-photo-3062946.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '5',
    name: 'Ergonomic Mechanical Keyboard',
    price: 125.00,
    images: ['https://images.pexels.com/photos/1772123/pexels-photo-1772123.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
  {
    id: '6',
    name: 'HD Webcam with Ring Light',
    price: 75.00,
    images: ['https://images.pexels.com/photos/7238759/pexels-photo-7238759.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'],
  },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
  }),
};

export function Landing({ onNavigate, onSelectProduct }: LandingProps) {
  const [featuredProducts] = useState<Product[]>(mockFeaturedProducts);
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const slideIndex = ((page % slides.length) + slides.length) % slides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [page]);

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-neutral-900">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            className="absolute inset-0 w-full h-full"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <img
              src={slides[slideIndex].image}
              alt={slides[slideIndex].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
          <motion.h1
            key={slideIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            {slides[slideIndex].title}
          </motion.h1>
          <motion.p
            key={slideIndex + 'p'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl text-neutral-200 mb-8 max-w-2xl"
          >
            {slides[slideIndex].subtitle}
          </motion.p>
          <motion.button
            key={slideIndex + 'b'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            onClick={() => onNavigate(slides[slideIndex].buttonLink)}
            className="bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-transform transform hover:scale-105"
          >
            {slides[slideIndex].buttonText}
          </motion.button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage([i, i > slideIndex ? 1 : -1])}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === slideIndex ? 'bg-white' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => paginate(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 rounded-full hover:bg-black/50 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => paginate(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/20 rounded-full hover:bg-black/50 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </section>

      {/* Shop by Category Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-text mb-10">Shop by Category</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-8 scrollbar-hide">
            {categories.map((category) => (
              <div key={category.name} className="relative rounded-xl overflow-hidden group cursor-pointer shadow-sm w-64 sm:w-72 flex-shrink-0 lg:w-auto" onClick={() => onNavigate('shop')}>
                <img src={category.image} alt={category.name} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Repair Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-border">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-text mb-4">
                Device Not Working?
              </h2>
              <p className="text-textSecondary mb-6">
                Don't worry! Our expert technicians can fix it. From cracked screens to battery issues, we've got you covered.
              </p>
              <button
                onClick={() => onNavigate('repair')}
                className="bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-transform transform hover:scale-105 flex items-center gap-2 mx-auto md:mx-0"
              >
                <Wrench className="w-5 h-5" />
                Book a Repair
              </button>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Repair service" 
                className="rounded-xl object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-text mb-10">Featured Products</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-8 scrollbar-hide">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product.id)}
                className="bg-background border border-border rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-64 sm:w-72 flex-shrink-0 lg:w-auto"
              >
                <div className="relative h-56 bg-surface">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-base font-semibold text-text truncate">{product.name}</h3>
                  <p className="text-lg font-bold text-primary mt-2">₹{product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('shop')}
              className="text-primary font-semibold hover:underline flex items-center gap-2 justify-center mx-auto"
            >
              View All Products <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
