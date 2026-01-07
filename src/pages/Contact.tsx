import { Phone, Mail, MapPin, ChevronDown, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';

const faqs = [
  {
    question: 'What are your shipping options?',
    answer: 'We offer standard, expedited, and overnight shipping. Shipping costs and delivery times vary based on your location and the shipping method selected at checkout.',
  },
  {
    question: 'How can I track my order?',
    answer: 'Once your order has shipped, you will receive an email with a tracking number and a link to the carrier\'s website. You can also find tracking information in your account\'s order history.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of purchase for a full refund. Items must be in their original condition with all tags and packaging intact. Please visit our returns page to initiate a return.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to over 50 countries worldwide. International shipping rates and times will be calculated at checkout. Please note that customers are responsible for any customs fees or import duties.',
  },
];

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Our support team will get back to you within 24 hours.',
    contact: 'accessoriesbutcheapermails@gmail.com',
    href: 'mailto:accessoriesbutcheapermails@abc.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Tuesday-Sunday from 10am to 5pm.',
    contact: '9311216285',
    href: 'tel:9311216285',
  },
  {
    icon: MapPin,
    title: 'Office',
    description: 'Narayana village new delhi 110028',
    contact: 'Get Directions',
    href: 'https://maps.app.goo.gl/9RXcHWvzHYwRPEH69',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

function ContactForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  // phone is optional for contact form; not collected in this form
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
    await api.post('/api/misc/contact', { firstName, lastName, email, message });
      setSubmitted(true);
    } catch (err) {
      console.error('Contact submit failed', err);
      error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h3 className="text-2xl font-bold">Thanks — we'll be in touch!</h3>
        <p className="text-gray-600 mt-2">Your message has been sent to our team.</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="first-name" className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} type="text" id="first-name" required className="bg-white border border-gray-200 text-gray-900 rounded-lg w-full p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200" />
        </div>
        <div>
          <label htmlFor="last-name" className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} type="text" id="last-name" className="bg-white border border-gray-200 text-gray-900 rounded-lg w-full p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" id="email" required className="bg-white border border-gray-200 text-gray-900 rounded-lg w-full p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-600 mb-1">Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} id="message" rows={4} required className="bg-white border border-gray-200 text-gray-900 rounded-lg w-full p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200"></textarea>
      </div>
      <div>
        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 btn-brand py-3 px-4 rounded-lg hover:opacity-90 transition-opacity shadow-glow-primary">
          <Send className="w-5 h-5" />
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </form>
  );
}

export function Contact() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <section className="relative bg-gray-50 pt-32 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-[#E33B57] via-[#F59B2E] to-[#2AA7DF] text-transparent bg-clip-text">
            Get in Touch
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Whether you have a question about our products, an order, or anything else, our team is ready to answer all your questions.
          </p>
        </motion.div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Details */}
          <motion.div 
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Contact Information</h2>
            {contactInfo.map((item, index) => (
              <motion.div key={index} className="flex items-start gap-5" variants={itemVariants}>
                <div className="bg-white text-primary p-4 rounded-xl border border-gray-200">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline transition-colors">
                    {item.contact}
                  </a>
                </div>
              </motion.div>
            ))}
             <motion.div className="rounded-xl overflow-hidden border border-gray-200" variants={itemVariants}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.2158539306374!2d77.14434661824404!3d28.62329209100505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0331c5debda9%3A0xb086f436fa3bc42d!2sNaraina%20Village%2C%20Naraina%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1762983157692!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="bg-gray-50 p-8 rounded-2xl border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <ContactForm />
          </motion.div>
        </div>
      </section>

      {/* Q&A Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-gray-600 max-w-xl mx-auto">Find quick answers to common questions about our services and products.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white p-5 border border-gray-200 rounded-xl">
                <summary className="flex justify-between items-center cursor-pointer font-medium text-gray-900 group-hover:text-primary transition-colors">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 transition-transform duration-300 group-open:rotate-180 text-primary" />
                </summary>
                <p className="mt-4 text-gray-600 text-sm leading-6">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
