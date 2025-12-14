import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const policies = [
  {
    icon: AlertCircle,
    title: 'No Cash on Delivery',
    description: 'Cash on Delivery (COD) is not available for any orders. All purchases must be made through our secure online payment gateway.',
    color: 'text-orange-500',
  },
  {
    icon: CheckCircle,
    title: 'Warranty-Based Replacement',
    description: 'Only spare parts that come with a manufacturer warranty will be eligible for replacement. Warranty terms and conditions apply as per the manufacturer specifications.',
    color: 'text-green-500',
  },
  {
    icon: XCircle,
    title: 'No Return Policy',
    description: 'Please note that we do not accept returns on any products. Once a purchase is made, it is final. Choose carefully before placing your order.',
    color: 'text-red-500',
  },
];

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, digital wallets, and other online payment methods through our secure payment gateway. Please note that Cash on Delivery is not available.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Orders can be cancelled before they are dispatched. Once shipped, items cannot be cancelled or returned. Contact our support team immediately if you wish to cancel.',
  },
  {
    question: 'What if the product is defective?',
    answer: 'If a product arrives defective and comes with a warranty, it will be replaced according to the manufacturer\'s warranty terms. Please contact us with proof of the defect within the warranty period.',
  },
  {
    question: 'How long is the warranty valid?',
    answer: 'Warranty periods vary by product and manufacturer. The warranty duration will be mentioned on the product page and in the invoice. Always check the specific terms before purchase.',
  },
  {
    question: 'Can I exchange a product?',
    answer: 'We do not offer exchanges. If you need a different product, please place a new order. Items from your previous order cannot be exchanged.',
  },
];

export default function RefundPolicy() {
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
            Refund & Cancellation Policy
          </h1>
          <p className="mt-6 text-lg text-white text-opacity-90 max-w-2xl mx-auto">
            Understand our policies regarding refunds, cancellations, and returns.
          </p>
        </motion.div>
      </section>

      {/* Key Policies */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-gray-900">Key Policies</h2>
            <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              Important information you need to know before making a purchase.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-xl border border-gray-200 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <policy.icon className={`w-16 h-16 ${policy.color} mx-auto mb-4`} />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{policy.title}</h3>
                <p className="text-gray-600 leading-6">{policy.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-gray-900">Policy Details</h2>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              className="bg-white p-8 rounded-xl border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                No Cash on Delivery Available
              </h3>
              <p className="text-gray-600 leading-8">
                We have discontinued Cash on Delivery (COD) services for all orders. All transactions must be completed through our secure online payment gateway. This ensures faster processing and enhanced security for both customers and our business. We accept all major credit cards, debit cards, digital wallets, and UPI payments.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Only Warranty-Backed Spare Parts Replaced
              </h3>
              <p className="text-gray-600 leading-8">
                We replace spare parts only if they come with an active manufacturer warranty. Non-warranted items, used items, or items with expired warranties cannot be replaced. Make sure to verify the warranty status before purchase. All warranty claims must be made within the specified warranty period with proper documentation.
              </p>
            </motion.div>

            <motion.div
              className="bg-white p-8 rounded-xl border border-gray-200"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-500" />
                No Return Policy
              </h3>
              <p className="text-gray-600 leading-8">
                All sales are final. We do not accept returns under any circumstances. This is why we encourage you to carefully review product descriptions, specifications, and compatibility before making a purchase. If you have any doubts about a product, please contact our customer support team before ordering. Once purchased, items cannot be returned or exchanged.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.details
                key={index}
                className="group bg-white p-6 border border-gray-200 rounded-xl hover:border-primary transition-colors"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {faq.question}
                  <span className="text-primary transform group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-gray-600 leading-8">
                  {faq.answer}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-16">
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl font-bold mb-4">Need Clarification?</h3>
          <p className="text-lg text-opacity-90 mb-8 max-w-2xl mx-auto">
            If you have any questions about our refund and cancellation policy, please don't hesitate to contact us.
          </p>
          <a 
            href="mailto:accessoriesbutcheapermails@gmail.com" 
            className="inline-block bg-white text-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Contact Support
          </a>
        </motion.div>
      </section>
    </div>
  );
}