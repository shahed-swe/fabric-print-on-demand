import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-white mb-4">Custom Print Service</h4>
          <p className="text-sm">Professional DTF printing solutions for Australian businesses.</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/" className="hover:text-orange-500 transition">Home</a></li>
            <li><a href="/print-on-demand" className="hover:text-orange-500 transition">Products</a></li>
            <li><a href="/about" className="hover:text-orange-500 transition">About Us</a></li>
            <li><a href="/about#faq" className="hover:text-orange-500 transition">FAQ</a></li>
            <li><a href="/contact" className="hover:text-orange-500 transition">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/privacy" className="hover:text-orange-500 transition">Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-orange-500 transition">Terms of Service</a></li>
            <li><a href="/cookies" className="hover:text-orange-500 transition">Cookie Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Contact</h4>
          <p className="text-sm">Email: shahed@k53tech.com</p>
          <p className="text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
          <p className="text-sm">Saturday: 10:00 AM - 4:00 PM</p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>&copy; 2026 Custom Print Service. All rights reserved.</p>
      </div>
    </footer>
  );
}
