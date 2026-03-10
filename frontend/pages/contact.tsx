import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import api from '../config/axios';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await api.post('/contact', formData);

            if (response.data.success) {
                setSuccess(true);
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    subject: '',
                    message: ''
                });
                setTimeout(() => setSuccess(false), 5000);
            } else {
                throw new Error(response.data.message || 'Failed to send message');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
            console.error('Contact form error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <NavBar />

            {/* Hero Section */}
            <section className="relative py-20 md:py-32 bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500 text-white overflow-hidden">
                {/* Animated Background Shapes */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                            Get In <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">Touch</span>
                        </h1>
                        <p className="text-2xl text-white/90">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
                    </div>
                </div>
            </section>

            {/* Contact Content Section */}
            <section className="py-20 md:py-32 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Information */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900">Contact Information</h2>

                            <div className="space-y-8">
                                {/* Email */}
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                                            <FaEnvelope className="text-xl" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                                        <p className="text-gray-600">contact@customprintshop.com</p>
                                        <p className="text-gray-600">support@customprintshop.com</p>
                                    </div>
                                </div>

                                {/* Business Hours */}
                                <div className="mt-12 p-6 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li className="flex justify-between"><span>Monday - Friday:</span> <span>9:00 AM - 6:00 PM</span></li>
                                        <li className="flex justify-between"><span>Saturday:</span> <span>10:00 AM - 4:00 PM</span></li>
                                        <li className="flex justify-between"><span>Sunday:</span> <span>Closed</span></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-12 text-gray-900">Send us a Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Success Message */}
                                {success && (
                                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-800 font-semibold">
                                        ✓ Thank you! We've received your message and will get back to you soon.
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-800 font-semibold">
                                        ✗ {error}
                                    </div>
                                )}

                                {/* First Name & Last Name */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-3">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="John"
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition duration-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-3">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Doe"
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition duration-300"
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-3">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition duration-300"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-3">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="How can we help?"
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition duration-300"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-3">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tell us more about your inquiry..."
                                        rows={6}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-orange-500 transition duration-300 resize-none"
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:shadow-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <FaPaperPlane className="text-lg" />
                                    {loading ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section (Optional) */}
            <section className="py-20 md:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-black mb-6">Visit Our Office</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">Stop by our creative studio to see our work and discuss your custom printing needs in person.</p>
                    </div>
                    <div className="w-full h-96 bg-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                        {/* Map placeholder - Replace with actual map integration */}
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default ContactPage;
