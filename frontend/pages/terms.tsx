import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Terms() {
  const terms = [
    {
      number: '1',
      title: 'Artwork Responsibility',
      description: 'Customers must ensure they own or have appropriate rights to any artwork submitted. We are not liable for copyright or trademark infringements.'
    },
    {
      number: '2',
      title: 'Print Variations',
      description: 'Slight color variations may occur due to screen differences, fabric types, and production processes.'
    },
    {
      number: '3',
      title: 'Order Confirmation',
      description: 'Orders are confirmed once payment is received. Production begins after order confirmation.'
    },
    {
      number: '4',
      title: 'Turnaround Times',
      description: 'Production and delivery times are estimates and may vary during peak periods.'
    },
    {
      number: '5',
      title: 'Refunds and Replacements',
      description: 'Due to the customized nature of our products, we do not offer refunds for change of mind. We will rectify or replace items that are defective or incorrectly produced.'
    },
    {
      number: '6',
      title: 'Limitation of Liability',
      description: 'Our liability is limited to the value of the goods supplied.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg md:text-xl opacity-90">Please read our terms carefully</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <p className="text-gray-700 text-lg leading-relaxed">
            By accessing and using our website, you agree to the following terms and conditions. Please read them carefully before placing an order.
          </p>
        </div>

        {/* Terms List */}
        <div className="space-y-6 mb-12">
          {terms.map((term, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold flex-shrink-0">
                  {term.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{term.title}</h3>
                  <p className="text-gray-700">{term.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Note */}
        <div className="bg-pink-50 border-l-4 border-pink-500 pl-6 py-6 rounded">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Important</h3>
          <p className="text-gray-700">
            You agree to these terms by making a purchase from Custom Print Service. If you do not agree with any part of these terms, please do not use our services.
          </p>
        </div>

        {/* Footer Note */}
        <div className="text-gray-700 text-sm italic mt-8">
          <p>Last updated: March 2026</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
