import { motion } from 'framer-motion';

const sections = [
  {
    title: 'Information We Collect',
    content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This includes your name, email address, postal address, phone number, and payment information.',
  },
  {
    title: 'How We Use Your Information',
    content: 'We use the information we collect to process your orders, send you product updates, provide customer support, and improve our services. We may also use your information to comply with legal obligations and prevent fraud.',
  },
  {
    title: 'Data Security',
    content: 'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or destruction. Your payment information is encrypted and processed securely.',
  },
  {
    title: 'Cookies and Tracking',
    content: 'We use cookies and similar tracking technologies to enhance your browsing experience. These help us understand how you use our website and allow us to improve its functionality.',
  },
  {
    title: 'Third-Party Sharing',
    content: 'We do not sell your personal information to third parties. We may share information with service providers who assist us in operating our website and conducting our business, all bound by confidentiality agreements.',
  },
  {
    title: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal information at any time. You can also opt out of promotional communications. Contact us for assistance with any of these requests.',
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="bg-white text-gray-900">
      {/* Header */}
      <section className="relative bg-gradient-to-r from-primary via-secondary to-accent pt-32 pb-20 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="mt-6 text-lg text-white text-opacity-90 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your personal information.
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="text-gray-600 text-lg leading-8">
              This Privacy Policy describes our practices regarding the collection, use, and disclosure of information that we receive from users of our website and mobile applications. Please read this policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by this policy.
            </p>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-xl border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                <p className="text-gray-600 leading-8">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            className="mt-16 bg-gradient-to-r from-primary to-secondary p-8 rounded-xl text-white"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-4">Questions About Our Privacy Policy?</h3>
            <p className="text-opacity-90 mb-6">
              If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
            </p>
            <a 
              href="mailto:accessoriesbutcheapermails@gmail.com" 
              className="inline-block bg-white text-primary font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}