import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Wrench, Smartphone, ShieldCheck, Clock, ChevronLeft, CheckCircle } from 'lucide-react';

// Your existing interfaces
interface DeviceModel {
  id: string;
  name: string;
  imageUrl: string;
}

interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  models: DeviceModel[];
}

const repairBrands: Brand[] = [
  {
    id: 'apple',
    name: 'Apple',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    models: [
      { id: 'iphone-15-pro', name: 'iPhone 15 Pro', imageUrl: 'https://images.pexels.com/photos/18463581/pexels-photo-18463581.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-15', name: 'iPhone 15', imageUrl: 'https://images.pexels.com/photos/18332331/pexels-photo-18332331.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-14-pro', name: 'iPhone 14 Pro', imageUrl: 'https://images.pexels.com/photos/13684853/pexels-photo-13684853.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-14', name: 'iPhone 14', imageUrl: 'https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-13', name: 'iPhone 13', imageUrl: 'https://images.pexels.com/photos/10403900/pexels-photo-10403900.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-se', name: 'iPhone SE', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
  {
    id: 'samsung',
    name: 'Samsung',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    models: [
      { id: 'galaxy-s24-ultra', name: 'Galaxy S24 Ultra', imageUrl: 'https://images.pexels.com/photos/20492307/pexels-photo-20492307.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-s24', name: 'Galaxy S24', imageUrl: 'https://images.pexels.com/photos/15598183/pexels-photo-15598183.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-z-fold-5', name: 'Galaxy Z Fold 5', imageUrl: 'https://images.pexels.com/photos/1786433/pexels-photo-1786433.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-z-flip-5', name: 'Galaxy Z Flip 5', imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'galaxy-a54', name: 'Galaxy A54', imageUrl: 'https://images.pexels.com/photos/47261/samsung-mobile-phone-samsung-galaxy-47261.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    models: [
      { id: 'pixel-8-pro', name: 'Pixel 8 Pro', imageUrl: 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'pixel-8', name: 'Pixel 8', imageUrl: 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'pixel-fold', name: 'Pixel Fold', imageUrl: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'pixel-7a', name: 'Pixel 7a', imageUrl: 'https://images.pexels.com/photos/1647976/pexels-photo-1647976.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ]
  },
  {
    id: 'oneplus',
    name: 'OnePlus',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/OnePlus_logo.svg',
    models: [
      { id: 'oneplus-12', name: 'OnePlus 12', imageUrl: 'https://images.pexels.com/photos/1478276/pexels-photo-1478276.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'oneplus-open', name: 'OnePlus Open', imageUrl: 'https://images.pexels.com/photos/1036804/pexels-photo-1036804.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'oneplus-11', name: 'OnePlus 11', imageUrl: 'https://images.pexels.com/photos/1261820/pexels-photo-1261820.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'oneplus-nord-3', name: 'OnePlus Nord 3', imageUrl: 'https://images.pexels.com/photos/2769274/pexels-photo-2769274.jpeg?auto=compress&cs=tinysrgb&w=400' },
    ]
  },
];

const features = [
  { icon: Wrench, title: 'Expert Technicians', description: 'Our technicians are certified and trained to handle any device issue.' },
  { icon: Smartphone, title: 'Genuine Parts', description: 'We use only high-quality, genuine parts for all our repairs.' },
  { icon: ShieldCheck, title: '6-Month Warranty', description: 'All our repairs come with a 6-month warranty for your peace of mind.' },
  { icon: Clock, title: 'Quick Service', description: 'Get your device repaired in as little as 30 minutes.' },
];

type RepairStep = 'selection' | 'details' | 'confirmation';

function RepairBookingFlow() {
  const [step, setStep] = useState<RepairStep>('selection');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [issueDetails, setIssueDetails] = useState({ problem: '', name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = repairBrands.find(b => b.id === e.target.value);
    setSelectedBrand(brand || null);
    setSelectedModel(null); // Reset model when brand changes
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = selectedBrand?.models.find(m => m.id === e.target.value);
    setSelectedModel(model || null);
  };

  const handleContinue = () => {
    if (selectedBrand && selectedModel) {
      setStep('details');
    }
  };

  const handleBack = () => {
    setStep('selection');
    setSelectedModel(null);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIssueDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      setIsSubmitting(true);
      try {
        await api.post('/api/misc/repair', {
          brand: selectedBrand?.name,
          model: selectedModel?.name,
          problem: issueDetails.problem,
          name: issueDetails.name,
          phone: issueDetails.phone,
        });

        setIsSubmitting(false);
        setStep('confirmation');
      } catch (err) {
        console.error('Repair submit failed', err);
        setIsSubmitting(false);
        // Optionally show error to user
        alert('Failed to submit repair request. Please try again later.');
      }
    })();
  };
  
  const resetFlow = () => {
    setStep('selection');
    setSelectedBrand(null);
    setSelectedModel(null);
    setIssueDetails({ problem: '', name: '', phone: '' });
  };

  const renderStep = () => {
    switch (step) {
      case 'selection':
        return (
          <motion.div key="selection" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <div className="space-y-8">
              {/* Step 1: Select Brand */}
              <div>
                <label htmlFor="brand-select" className="block text-2xl font-bold text-gray-900 mb-4">
                  Step 1: Select a Brand
                </label>
                <select
                  id="brand-select"
                  value={selectedBrand?.id || ''}
                  onChange={handleBrandChange}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                >
                  <option value="">-- Select a Brand --</option>
                  {repairBrands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Model (only shown when brand is selected) */}
              {selectedBrand && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="model-select" className="block text-2xl font-bold text-gray-900 mb-4">
                    Step 2: Select a Model for {selectedBrand.name}
                  </label>
                  <select
                    id="model-select"
                    value={selectedModel?.id || ''}
                    onChange={handleModelChange}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                  >
                    <option value="">-- Select a Model --</option>
                    {selectedBrand.models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

              {/* Continue Button */}
              {selectedBrand && selectedModel && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="pt-4"
                >
                  <button
                    onClick={handleContinue}
                    className="w-full bg-primary text-white font-semibold py-4 px-8 rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                  >
                    Continue to Book Appointment
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        );

      case 'details':
        return (
          <motion.div key="details" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <button onClick={handleBack} className="flex items-center gap-2 mb-6 text-primary hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back to Selection
            </button>
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Step 3: Book an Appointment</h3>
            <p className="text-center text-gray-600 mb-8">For: {selectedBrand?.name} {selectedModel?.name}</p>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
              <textarea 
                name="problem" 
                value={issueDetails.problem} 
                onChange={handleFormChange} 
                placeholder="Describe the issue with your device..." 
                required 
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all" 
                rows={4}
              ></textarea>
              <input 
                type="text" 
                name="name" 
                value={issueDetails.name} 
                onChange={handleFormChange} 
                placeholder="Your Full Name" 
                required 
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all" 
              />
              <input 
                type="tel" 
                name="phone" 
                value={issueDetails.phone} 
                onChange={handleFormChange} 
                placeholder="Your Phone Number" 
                required 
                className="w-full p-3 bg-white border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all" 
              />
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </motion.div>
        );

      case 'confirmation':
        return (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Appointment Booked!</h3>
            <p className="text-gray-600 mb-6">Our technician will contact you shortly to confirm the details.</p>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 max-w-md mx-auto text-left mb-6">
              <p><strong>Device:</strong> {selectedBrand?.name} {selectedModel?.name}</p>
              <p><strong>Name:</strong> {issueDetails.name}</p>
              <p><strong>Phone:</strong> {issueDetails.phone}</p>
            </div>
            <button 
              onClick={resetFlow} 
              className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity shadow-lg"
            >
              Book Another Repair
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-xl">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

export function Repair() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gray-50 pt-32 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Expert Smartphone Repair
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Fast, reliable, and affordable repair services. Get your phone fixed at your doorstep by our certified technicians.
          </p>
        </motion.div>
      </section>

      {/* Repair Booking Section */}
      <section id="book-repair" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RepairBookingFlow />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 border border-gray-200 rounded-xl text-center"
              >
                <div className="inline-block p-4 bg-blue-100 text-blue-600 rounded-lg mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
