import { motion } from 'framer-motion';
import { Award, Users, Zap, Heart } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'We offer only the highest quality products carefully selected from trusted manufacturers.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We listen to your feedback and continuously improve.',
  },
  {
    icon: Zap,
    title: 'Fast Service',
    description: 'Quick shipping and responsive customer support to ensure you get what you need on time.',
  },
  {
    icon: Heart,
    title: 'Best Prices',
    description: 'We believe great products shouldn\'t break the bank. Find the best deals with us.',
  },
];

export default function AboutUs() {
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
            About ABC Accessories But Cheaper
          </h1>
          <p className="mt-6 text-lg text-white text-opacity-90 max-w-2xl mx-auto">
            Your trusted destination for quality accessories, spare parts, and gadgets at unbeatable prices.
          </p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 text-lg mb-4">
                Founded with a simple mission: to make premium accessories and spare parts affordable for everyone. We believe that quality shouldn't come with a premium price tag.
              </p>
              <p className="text-gray-600 text-lg mb-4">
                Over the years, we've grown to become a trusted platform serving thousands of satisfied customers across the country. We partner with reliable manufacturers and suppliers to bring you the best products at the cheapest prices.
              </p>
              <p className="text-gray-600 text-lg">
                Our commitment to excellence and customer satisfaction drives everything we do. From product selection to after-sales support, we're here for you.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gradient-to-br from-primary to-secondary p-8 rounded-2xl text-white"
            >
              <h3 className="text-2xl font-bold mb-4">Our Values</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <strong>Transparency</strong>
                    <p className="text-sm text-opacity-90">Honest pricing and clear information about all our products.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <strong>Quality</strong>
                    <p className="text-sm text-opacity-90">Every product is checked for quality before it reaches you.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <strong>Reliability</strong>
                    <p className="text-sm text-opacity-90">Consistent service you can depend on, always.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              We're committed to delivering the best experience in every interaction.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-primary transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}