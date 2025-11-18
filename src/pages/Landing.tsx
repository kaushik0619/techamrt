import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface LandingProps {
  onNavigate: (page: string, category?: string, subcategory?: string) => void;
  onSelectProduct: (id: string) => void;
}

const slides = [
  {
    title: 'Dont miss this exclusive deals!',
    subtitle: 'Grab it now before it is too late.',
    image: '/collection.png',
    buttonText: 'Explore Deals',
    buttonLink: 'deals',
  },
  {
    title: 'Power up your Z Series',
    subtitle: 'Find cases and accessories that match your lifestyle.',
    image: '/samsungfold.png',
    buttonText: 'Shop Covers',
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
  const [airpodProducts, setAirpodProducts] = useState<Product[]>([]);
  const airpodRef = useRef<HTMLDivElement | null>(null);
  const featuredRef = useRef<HTMLDivElement | null>(null);
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

  // Fetch AirPod products (both direct AirPods category and accessories->airpods)
  useEffect(() => {
    let mounted = true;

    async function loadAirpods() {
      try {
        const [resp1, resp2] = await Promise.all([
          api.get('/api/products', { params: { category: 'AirPods', limit: 50 } }),
          api.get('/api/products', { params: { category: 'accessories', subcategory: 'airpods', limit: 50 } }),
        ]);

        const list1: Product[] = resp1?.products || [];
        const list2: Product[] = resp2?.products || [];

        // Merge and dedupe by id
        const merged = [...list1, ...list2];
        const dedup = merged.reduce<Record<string, any>>((acc, p: any) => {
          const key = p._id?.toString() || p.id || `${p.name}-${Math.random()}`;
          acc[key] = p;
          return acc;
        }, {} as Record<string, any>);

        const result = Object.values(dedup).map((p: any) => ({ id: p._id?.toString() || p.id, name: p.name, price: p.price ?? 0, images: p.images && p.images.length ? p.images : [p.image || ''] }));

        if (mounted) setAirpodProducts(result.length ? result : mockFeaturedProducts);
      } catch (error) {
        console.error('Error loading airpod products', error);
        if (mounted) setAirpodProducts(mockFeaturedProducts);
      }
    }

    loadAirpods();

    return () => { mounted = false; };
  }, []);

  // Auto-scroll implementation with drag support
  function useAutoScroll(containerRef: React.RefObject<HTMLDivElement>, speed = 40) {
    const rafRef = useRef<number | null>(null);
    const isPointerDown = useRef(false);
    const startX = useRef(0);
    const startScroll = useRef(0);
    const paused = useRef(false);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const el = container; // local strong reference for closures
      const track = el.querySelector('.marquee-track') as HTMLElement | null;
      if (!track) return;
      const trackEl = track;

      let lastTime = performance.now();

      function step(now: number) {
        if (!trackEl) return;
        const dt = now - lastTime;
        lastTime = now;

        if (!isPointerDown.current && !paused.current) {
          const distance = (Math.abs(speed) * dt) / 1000; // px per ms
          const direction = speed > 0 ? 1 : -1;
          el.scrollLeft = el.scrollLeft + direction * distance;

          const half = trackEl.scrollWidth / 2;
          if (el.scrollLeft >= half) {
            el.scrollLeft = el.scrollLeft - half;
          }
          if (el.scrollLeft < 0) {
            el.scrollLeft = el.scrollLeft + half;
          }
        }

        rafRef.current = requestAnimationFrame(step);
      }

      rafRef.current = requestAnimationFrame(step);

      // Pointer handlers for drag
      function onPointerDown(e: PointerEvent) {
        isPointerDown.current = true;
        paused.current = true;
        try { el.setPointerCapture?.(e.pointerId); } catch {}
        startX.current = e.clientX;
        startScroll.current = el.scrollLeft;
      }

      function onPointerMove(e: PointerEvent) {
        if (!isPointerDown.current) return;
        const dx = e.clientX - startX.current;
        // drag left-to-right should move products left => increase scroll by dx
        el.scrollLeft = startScroll.current + dx;
        const half = trackEl.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        if (el.scrollLeft < 0) el.scrollLeft += half;
      }

      function onPointerUp(e: PointerEvent) {
        isPointerDown.current = false;
        paused.current = false;
        try { el.releasePointerCapture?.(e.pointerId); } catch {}
      }

      function onEnter() { paused.current = true; }
      function onLeave() { if (!isPointerDown.current) paused.current = false; }

      el.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        el.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
      };
    }, [containerRef, speed]);
  }

  // Start auto-scroll for both sections
  useAutoScroll(airpodRef, 40); // px/sec
  useAutoScroll(featuredRef, -30); // negative -> scroll in opposite direction

  return (
    <div className="bg-white">
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
            className="btn-brand px-8 py-3 hover:opacity-90 transition-transform transform hover:scale-105"
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Shop by Category</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:gap-8 scrollbar-hide">
            {categories.map((category) => (
              <div key={category.name} className="relative rounded-xl overflow-hidden group cursor-pointer shadow-sm w-48 sm:w-64 md:w-72 flex-shrink-0 lg:w-auto" onClick={() => onNavigate('shop')}>
                <img src={category.image} alt={category.name} className="w-full h-48 sm:h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <h3 className="text-white text-xl font-bold">{category.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apple Protective Case — Fullscreen Interactive Banner */}
      <section className="relative h-screen w-full bg-cover bg-center" style={{ backgroundImage: `url('/applecover.png')` }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4"
          >
            Apple Protective Case
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mb-8"
          >
            Slim, shock-absorbent, and precision-made for your device — shop our curated Apple cases built to protect.
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('shop')}
              className="btn-brand px-6 py-3 shadow-lg"
            >
              Shop Cases
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('repair')}
              className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-lg"
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Best Seller</h2>
          <div className="marquee" ref={featuredRef}>
            <div className="marquee-track" style={{ minWidth: 'max-content' }}>
              {[...featuredProducts, ...featuredProducts].map((product, idx) => (
                <div
                  key={`feat-${product.id}-${idx}`}
                  onClick={() => onSelectProduct(product.id)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-48 sm:w-64 md:w-72 flex-shrink-0"
                >
                  <div className="relative h-44 md:h-56 bg-gray-50">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-lg font-bold text-primary mt-2">₹{product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
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

      {/* Repair Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-200">
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Device Not Working?
              </h2>
              <p className="text-gray-600 mb-6">
                Don't worry! Our expert technicians can fix it. From cracked screens to battery issues, we've got you covered.
              </p>
              <button
                onClick={() => onNavigate('repair')}
                className="btn-brand px-8 py-3 hover:opacity-90 transition-transform transform hover:scale-105 flex items-center gap-2 mx-auto md:mx-0"
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
      
      {/* AirPod Cases — display as horizontally scrolling product cards (auto-scroll) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">AirPod Cases Collection</h2>
            <div>
              <button onClick={() => onNavigate('shop', 'accessories', 'airpods')} className="text-primary font-semibold hover:underline">View Collection</button>
            </div>
          </div>

          <div className="marquee" ref={airpodRef}>
            <div className="marquee-track" style={{ minWidth: 'max-content' }}>
              {[...airpodProducts, ...airpodProducts].map((product, idx) => (
                <div
                  key={`airpod-${product.id}-${idx}`}
                  onClick={() => onSelectProduct(product.id)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-48 sm:w-56 md:w-64 flex-shrink-0"
                >
                  <div className="relative h-44 md:h-52 bg-gray-50">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-4" />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-md font-bold text-primary mt-2">₹{product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
