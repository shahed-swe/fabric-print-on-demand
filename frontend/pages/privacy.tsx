import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg md:text-xl opacity-90">Your privacy is important to us</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 mb-8">
            At Custom Print Service, we are committed to protecting your privacy and handling personal information in accordance with Australian privacy standards.
          </p>

          {/* Section 1 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">We may collect the following information:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping addresses</li>
              <li>Payment details</li>
              <li>Uploaded artwork files</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">Your information is used to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
              <li>Process and fulfil orders</li>
              <li>Communicate regarding purchases</li>
              <li>Provide customer support</li>
              <li>Improve our services and website functionality</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-orange-50 border-l-4 border-orange-500 pl-6 py-6 mb-12 rounded">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Data Protection</h3>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent personal information to third parties.
            </p>
            <p className="text-gray-700">
              Payment transactions are processed through secure, trusted payment providers.
            </p>
          </div>

          {/* Additional Info */}
          <div className="text-gray-700 text-sm italic">
            <p>Last updated: March 2026</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
