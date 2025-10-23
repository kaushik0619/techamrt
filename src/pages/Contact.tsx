import { Phone, Mail, MapPin } from 'lucide-react';

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

export function Contact() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">Contact Us</h1>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            We're here to help! Whether you have a question about our products, an order, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        {/* Contact Info & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Details */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary-light text-primary-DEFAULT p-3 rounded-full">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">Email</h3>
                <p className="text-neutral-600">Our support team will get back to you within 24 hours.</p>
                <a href="mailto:support@abc.com" className="text-primary-DEFAULT font-medium hover:underline">support@abc.com</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary-light text-primary-DEFAULT p-3 rounded-full">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">Phone</h3>
                <p className="text-neutral-600">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+1234567890" className="text-primary-DEFAULT font-medium hover:underline">+1 (234) 567-890</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-primary-light text-primary-DEFAULT p-3 rounded-full">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">Office</h3>
                <p className="text-neutral-600">123 Tech Avenue, Silicon Valley, CA 94043</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-neutral-50 p-8 rounded-xl border border-neutral-200">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-neutral-700">First Name</label>
                  <input type="text" id="first-name" className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT" />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-neutral-700">Last Name</label>
                  <input type="text" id="last-name" className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700">Email</label>
                <input type="email" id="email" className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700">Message</label>
                <textarea id="message" rows={4} className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"></textarea>
              </div>
              <div>
                <button type="submit" className="w-full bg-primary-DEFAULT text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Q&A Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900">Frequently Asked Questions</h2>
            <p className="mt-3 text-neutral-600 max-w-xl mx-auto">Find quick answers to common questions about our services and products.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group p-4 border border-neutral-200 rounded-lg">
                <summary className="flex justify-between items-center cursor-pointer font-medium text-neutral-800 group-hover:text-primary-DEFAULT">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-neutral-600 text-sm leading-6">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
