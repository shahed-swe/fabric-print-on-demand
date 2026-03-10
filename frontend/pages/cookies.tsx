import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Cookies() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-lg md:text-xl opacity-90">How we use cookies on our website</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-12">
          <p className="text-gray-700 text-lg leading-relaxed mb-6">
            Our website uses cookies to enhance your browsing experience and provide essential functionality. This page explains what cookies are and how we use them.
          </p>
        </div>

        {/* What Are Cookies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-700 leading-relaxed">
            Cookies are small text files that are stored on your device (computer, tablet, or mobile) when you visit a website. They help websites remember information about your visit and improve your user experience.
          </p>
        </div>

        {/* How We Use Cookies */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Cookies</h2>
          <p className="text-gray-700 mb-6">Our website uses cookies to:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-2xl leading-snug">•</span>
              <span className="text-gray-700"><strong>Improve user experience:</strong> Remember your preferences and settings</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-2xl leading-snug">•</span>
              <span className="text-gray-700"><strong>Analyse website performance:</strong> Understand how visitors use our site and identify areas for improvement</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-2xl leading-snug">•</span>
              <span className="text-gray-700"><strong>Facilitate online ordering:</strong> Keep your shopping cart and order information secure</span>
            </li>
          </ul>
        </div>

        {/* Types of Cookies */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-orange-600 mb-3">Essential Cookies</h3>
            <p className="text-gray-700 text-sm">These cookies are necessary for the website to function properly and cannot be disabled.</p>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-pink-600 mb-3">Analytics Cookies</h3>
            <p className="text-gray-700 text-sm">These cookies help us understand how visitors interact with our website and improve our services.</p>
          </div>
        </div>

        {/* Disabling Cookies */}
        <div className="bg-gray-50 border-l-4 border-gray-400 pl-6 py-6 rounded mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Disabling Cookies</h3>
          <p className="text-gray-700 mb-4">
            You may disable cookies in your browser settings; however, some website features may not function correctly without them.
          </p>
          <p className="text-gray-700 text-sm">
            Most browsers allow you to refuse cookies and alert you when a cookie is being sent. Please refer to your browser's help section for instructions on managing cookies.
          </p>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-gray-200 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Questions About Our Cookies?</h3>
          <p className="text-gray-700 mb-4">
            If you have any questions about how we use cookies or your privacy, please contact us at:
          </p>
          <p className="text-gray-700 font-semibold">Email: shahed@k53tech.com</p>
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
