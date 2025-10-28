import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Smartphone, ShieldCheck, Clock, ArrowRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { repairBrands, Brand, DeviceModel } from '../data/repairData';

const features = [
  { icon: Wrench, title: 'Expert Technicians', description: 'Our technicians are certified and trained to handle any device issue.' },
  { icon: Smartphone, title: 'Genuine Parts', description: 'We use only high-quality, genuine parts for all our repairs.' },
  { icon: ShieldCheck, title: '6-Month Warranty', description: 'All our repairs come with a 6-month warranty for your peace of mind.' },
  { icon: Clock, title: 'Quick Service', description: 'Get your device repaired in as little as 30 minutes.' },
];

type RepairStep = 'brand' | 'model' | 'details' | 'confirmation';

function RepairBookingFlow() {
  const [step, setStep] = useState<RepairStep>('brand');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedModel, setSelectedModel] = useState<DeviceModel | null>(null);
  const [issueDetails, setIssueDetails] = useState({ problem: '', name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setStep('model');
  };

  const handleModelSelect = (model: DeviceModel) => {
    setSelectedModel(model);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'model') {
      setStep('brand');
      setSelectedBrand(null);
    } else if (step === 'details') {
      setStep('model');
      setSelectedModel(null);
    }
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIssueDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('confirmation');
    }, 1500);
  };
  
  const resetFlow = () => {
    setStep('brand');
    setSelectedBrand(null);
    setSelectedModel(null);
    setIssueDetails({ problem: '', name: '', phone: '' });
  };

  const renderStep = () => {
    switch (step) {
      case 'brand':
        return (
          <motion.div key="brand" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <h3 className="text-2xl font-bold text-center text-text mb-8">Step 1: Select a Brand</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {repairBrands.map((brand) => (
                <motion.div
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand)}
                  className="flex flex-col items-center justify-center p-6 bg-surface border border-border rounded-xl cursor-pointer transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <img src={brand.logoUrl} alt={brand.name} className="h-12 filter invert" />
                  <span className="mt-4 text-sm font-medium text-textSecondary">{brand.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 'model':
        return (
          <motion.div key="model" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <button onClick={handleBack} className="flex items-center gap-2 mb-6 text-primary hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back to Brands
            </button>
            <h3 className="text-2xl font-bold text-center text-text mb-8">Step 2: Select a Model for {selectedBrand?.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {selectedBrand?.models.map((model) => (
                <motion.div
                  key={model.id}
                  onClick={() => handleModelSelect(model)}
                  className="bg-surface border border-border rounded-xl cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                >
                  <img src={model.imageUrl} alt={model.name} className="h-40 w-full object-cover" />
                  <p className="p-4 font-semibold text-center text-text">{model.name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 'details':
        return (
          <motion.div key="details" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}>
            <button onClick={handleBack} className="flex items-center gap-2 mb-6 text-primary hover:underline">
              <ChevronLeft className="w-4 h-4" /> Back to Models
            </button>
            <h3 className="text-2xl font-bold text-center text-text mb-2">Step 3: Book an Appointment</h3>
            <p className="text-center text-textSecondary mb-8">For: {selectedBrand?.name} {selectedModel?.name}</p>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
              <textarea name="problem" value={issueDetails.problem} onChange={handleFormChange} placeholder="Describe the issue with your device..." required className="w-full p-3 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" rows={4}></textarea>
              <input type="text" name="name" value={issueDetails.name} onChange={handleFormChange} placeholder="Your Full Name" required className="w-full p-3 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
              <input type="tel" name="phone" value={issueDetails.phone} onChange={handleFormChange} placeholder="Your Phone Number" required className="w-full p-3 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" />
              <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity shadow-glow-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </motion.div>
        );
      case 'confirmation':
        return (
          <motion.div key="confirmation" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-3xl font-bold text-text mb-2">Appointment Booked!</h3>
            <p className="text-textSecondary mb-6">Our technician will contact you shortly to confirm the details.</p>
            <div className="bg-surface border border-border rounded-lg p-4 max-w-md mx-auto text-left mb-6">
              <p><strong>Device:</strong> {selectedBrand?.name} {selectedModel?.name}</p>
              <p><strong>Name:</strong> {issueDetails.name}</p>
              <p><strong>Phone:</strong> {issueDetails.phone}</p>
            </div>
            <button onClick={resetFlow} className="bg-primary text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity shadow-glow-primary">
              Book Another Repair
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="bg-background border border-border rounded-2xl p-6 sm:p-10 shadow-xl">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}

export function Repair() {
  return (
    <div className="bg-background text-text">
      {/* Hero Section */}
      <section className="relative bg-surface pt-32 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-4xl mx-auto px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-gradient-text bg-gradient-to-r from-primary via-secondary to-accent">
            Expert Smartphone Repair
          </h1>
          <p className="mt-6 text-lg text-textSecondary max-w-2xl mx-auto">
            Fast, reliable, and affordable repair services. Get your phone fixed at your doorstep by our certified technicians.
          </p>
        </motion.div>
      </section>

      {/* Repair Booking Section */}
      <section id="book-repair" className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RepairBookingFlow />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-text mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background p-6 border border-border rounded-xl text-center"
              >
                <div className="inline-block p-4 bg-primary/10 text-primary rounded-lg mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                <p className="text-sm text-textSecondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
