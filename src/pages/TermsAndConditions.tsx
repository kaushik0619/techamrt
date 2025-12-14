import { motion } from 'framer-motion';

const terms = [
  {
    title: 'Acceptance of Terms',
    content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
  },
  {
    title: 'Use License',
    content: 'Permission is granted to temporarily download one copy of the materials (information or software) on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to decompile or reverse engineer any software contained on the website; remove any copyright or other proprietary notations from the materials.',
  },
  {
    title: 'Disclaimer',
    content: 'The materials on our website are provided on an \'as is\' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
  },
  {
    title: 'Limitations',
    content: 'In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.',
  },
  {
    title: 'Accuracy of Materials',
    content: 'The materials appearing on our website could include technical, typographical, or photographic errors. We do not warrant that any of the materials on our website are accurate, complete, or current. We may make changes to the materials contained on our website at any time without notice.',
  },
  {
    title: 'Links',
    content: 'We have not reviewed all of the sites linked to our website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use of any such linked website is at the user\'s own risk.',
  },
  {
    title: 'Modifications',
    content: 'We may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.',
  },
  {
    title: 'Governing Law',
    content: 'These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.',
  },
];

export default function TermsAndConditions() {
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
            Terms and Conditions
          </h1>
          <p className="mt-6 text-lg text-white text-opacity-90 max-w-2xl mx-auto">
            Please read these terms carefully before using our services.
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
            className="mb-12"
          >
            <p className="text-gray-600 text-lg leading-8">
              Welcome to ABC Accessories But Cheaper. These terms and conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use this website if you do not accept these terms and conditions stated on this page.
            </p>
          </motion.div>

          <div className="space-y-8">
            {terms.map((term, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 p-8 rounded-xl border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{term.title}</h2>
                <p className="text-gray-600 leading-8">{term.content}</p>
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
            <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
            <p className="text-opacity-90 mb-6">
              If you have any questions about our terms and conditions, please reach out to us.
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