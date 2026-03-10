import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function About() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is DTF printing?',
      answer: 'Direct-to-Film (DTF) printing is a garment decoration method where designs are printed onto a specialized film and heat-pressed onto fabric. It produces durable, flexible, and vibrant prints suitable for various textiles.'
    },
    {
      question: 'What garments can you print on?',
      answer: 'We print on: T-shirts, Hoodies, Sweatshirts, Workwear, Sportswear, Tote bags, Cotton, polyester, and blended fabrics.'
    },
    {
      question: 'Is there a minimum order requirement?',
      answer: 'We accommodate both small and bulk orders.'
    },
    {
      question: 'What file formats do you accept?',
      answer: 'We recommend the following formats for best results: PNG (300 DPI, transparent background), PDF, AI (vector format), High-resolution JPG.'
    },
    {
      question: 'How long does production take?',
      answer: 'Standard shipment time is typically 15–25 business days, depending on order size and complexity. Larger orders may require additional time.'
    },
    {
      question: 'How durable is DTF prints?',
      answer: 'When properly cared for, DTF prints are highly durable and resistant to cracking or peeling.'
    },
    {
      question: 'How should printed garments be washed?',
      answer: 'Wash inside out, Cold wash only, Do not bleach, Do not iron directly on the print, Avoid tumble drying when possible.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Custom Print Service</h1>
          <p className="text-lg md:text-xl opacity-90">Professional DTF Printing Solutions for Australian Businesses</p>
        </div>
      </div>

      {/* About Us Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Are</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-4">
              Custom Print Service is a professional garment printing company specializing in high-quality Direct-to-Film (DTF) printing solutions.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              We provide reliable and consistent apparel printing services to businesses, brands, organizations, and individuals across Australia. Our advanced DTF technology allows us to produce vibrant, durable prints with exceptional detail on a wide range of fabrics.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-orange-600 mb-6">Our Commitment</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Premium print quality</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Consistent color accuracy</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Fast and dependable turnaround times</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Competitive pricing</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-3 text-xl">✓</span>
                <span className="text-gray-700">Professional customer support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Our Objective */}
        <div className="bg-white border-l-4 border-orange-500 pl-8 py-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Objective</h3>
          <p className="text-gray-700 text-lg">
            To provide efficient, high-quality garment printing services that support the growth of Australian businesses and brands. Whether you require small custom runs or large bulk production, our team ensures every order meets strict quality standards.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 text-left">{faq.question}</h3>
                  <span className="text-orange-500 ml-4 flex-shrink-0">
                    {expandedFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                
                {expandedFaq === index && (
                  <div className="px-6 py-4 bg-orange-50 border-t border-gray-200">
                    <p className="text-gray-700 text-base leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
