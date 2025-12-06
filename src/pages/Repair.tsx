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
      { id: 'iphone 17 pro max', name: 'iPhone 17 pro max', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 17 pro', name: 'iPhone 17 pro', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-air', name: 'iPhone air', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 17', name: 'iPhone 17', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-16 e', name: 'iPhone 16 e', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 16 pro max', name: 'iPhone 16 pro max', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 16 pro', name: 'iPhone 16 pro', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 16 plus', name: 'iPhone 16 plus', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 16', name: 'iPhone 16', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 15 plus', name: 'iPhone 15 plus', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 15 pro max', name: 'iPhone 15 Pro max', imageUrl: 'https://images.pexels.com/photos/18463581/pexels-photo-18463581.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 15 pro', name: 'iPhone 15 pro', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },  
      { id: 'iphone-15', name: 'iPhone 15', imageUrl: 'https://images.pexels.com/photos/18332331/pexels-photo-18332331.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone 14 plus', name: 'iPhone 14 plus', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-14-pro max', name: 'iPhone 14 Pro max', imageUrl: 'https://images.pexels.com/photos/13684853/pexels-photo-13684853.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-14 pro', name: 'iPhone 14 pro', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-14', name: 'iPhone 14', imageUrl: 'https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-se 2022', name: 'iPhone SE 2022', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-13 pro max', name: 'iPhone 13 pro max', imageUrl: 'https://images.pexels.com/photos/10403900/pexels-photo-10403900.jpeg?auto=compress&cs=tinysrgb&w=400' },
       { id: 'iphone-13 pro', name: 'iPhone 13 pro', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'iphone-13', name: 'iPhone 13', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
         { id: 'iphone-13-mini', name: 'iPhone 13 mini', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { id: 'iphone-12-pro max', name: 'iPhone 12 Pro Max', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
       { id: 'iphone-12-pro', name: 'iPhone 12 Pro', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
        { id: 'iphone-12-mini', name: 'iPhone 12 Mini', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
         { id: 'iphone-12', name: 'iPhone 12', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
          { id: 'iphone-se-2020', name: 'iPhone SE 2020', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
           { id: 'iphone-11-pro max', name: 'iPhone 11 pro max', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
            { id: 'iphone-11-pro', name: 'iPhone 11 pro', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
             { id: 'iphone-11', name: 'iPhone 11', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { id: 'iphone-xs-max', name: 'iPhone XS Max', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
             { id: 'iphone-xs', name: 'iPhone XS', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
              { id: 'iphone-xr', name: 'iPhone XR', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
               { id: 'iphone-x', name: 'iPhone X', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                { id: 'iphone-8-plus', name: 'iPhone 8 Plus', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                 { id: 'iphone-8', name: 'iPhone 8', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                  { id: 'iphone-7-plus', name: 'iPhone 7 Plus', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                 { id: 'iphone-7', name: 'iPhone 7', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                  { id: 'iphone-se-gen-1', name: 'iPhone SE first generation', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                   { id: 'iphone-6s-plus', name: 'iPhone 6s Plus', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                    { id: 'iphone-6s', name: 'iPhone 6s', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                     { id: 'iphone-6-plus', name: 'iPhone 6 Plus', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },
                      { id: 'iphone-6', name: 'iPhone 6', imageUrl: 'https://images.pexels.com/photos/4065624/pexels-photo-4065624.jpeg?auto=compress&cs=tinysrgb&w=400' },

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
  {
  id: 'poco',
  name: 'POCO',
  logoUrl: 'data:image/png;base64,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',
  models: [
    { id: 'poco-c40', name: 'POCO C40', imageUrl: '' },
    { id: 'poco-m5s', name: 'POCO M5s', imageUrl: '' },
    { id: 'poco-f5-pro', name: 'POCO F5 Pro', imageUrl: '' },
    { id: 'poco-m2-reloaded', name: 'POCO M2 Reloaded', imageUrl: '' },
    { id: 'poco-f1', name: 'POCO F1', imageUrl: '' },
    { id: 'poco-x2', name: 'POCO X2', imageUrl: '' },

    { id: 'poco-m2-pro', name: 'POCO M2 Pro', imageUrl: '' },
    { id: 'poco-m2', name: 'POCO M2', imageUrl: '' },
    { id: 'poco-c3', name: 'POCO C3', imageUrl: '' },
    { id: 'poco-x3', name: 'POCO X3', imageUrl: '' },
    { id: 'poco-m3', name: 'POCO M3', imageUrl: '' },
    { id: 'poco-x3-pro', name: 'POCO X3 Pro', imageUrl: '' },

    { id: 'poco-m3-pro-5g', name: 'POCO M3 Pro 5G', imageUrl: '' },
    { id: 'poco-m4-pro', name: 'POCO M4 Pro', imageUrl: '' },
    { id: 'poco-x4-pro-5g', name: 'POCO X4 Pro 5G', imageUrl: '' },
    { id: 'poco-m4-5g', name: 'POCO M4 5G', imageUrl: '' },
    { id: 'poco-f4-5g', name: 'POCO F4 5G', imageUrl: '' },
    { id: 'poco-c50', name: 'POCO C50', imageUrl: '' },

    { id: 'poco-c55', name: 'POCO C55', imageUrl: '' },
    { id: 'poco-c51', name: 'POCO C51', imageUrl: '' },
    { id: 'poco-f5-5g', name: 'POCO F5 5G', imageUrl: '' },
    { id: 'poco-c65', name: 'POCO C65', imageUrl: '' },
    { id: 'poco-x5-5g', name: 'POCO X5 5G', imageUrl: '' },
    { id: 'poco-m6-5g', name: 'POCO M6 5G', imageUrl: '' },

    { id: 'poco-f6-5g', name: 'POCO F6 5G', imageUrl: '' },
    { id: 'poco-x7-5g', name: 'POCO X7 5G', imageUrl: '' }
  ]
}

];


const features = [
  { icon: Wrench, title: 'Expert Technicians', description: 'Our technicians are certified and trained to handle any device issue.' },
  { icon: Smartphone, title: 'Genuine Parts', description: 'We use only high-quality, genuine parts for all our repairs.' },
  { icon: ShieldCheck, title: '3-Month Warranty', description: 'All our repairs come with a 3-month warranty for your peace of mind.' },
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
            <div className="space-y-8r">
              {/* Step 1: Select Brand */}
              <div>
                <label htmlFor="brand-select" className="block text-2xl font-bold text-gray-900 mb-4">
                  Step 1: Select a Brand
                </label>
                <select
                  id="brand-select"
                  value={selectedBrand?.id || ''}
                  onChange={handleBrandChange}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-error focus:border-error outline-none transition-all bg-white"
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
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-error focus:border-error outline-none transition-all bg-white"
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
                    className="w-full btn-brand py-4 px-8 hover:opacity-90 transition-opacity shadow-lg"
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
                className="w-full btn-brand py-3 px-8 rounded-lg hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="btn-brand py-3 px-8 hover:opacity-90 transition-opacity shadow-lg"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
