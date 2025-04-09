import React, { useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { FaPencilAlt, FaTshirt, FaMagic, FaShippingFast, FaUsers, FaStar, FaComments } from 'react-icons/fa';

import { useRouter } from 'next/router';

const LandingPage = () => {

    const router = useRouter();

    const handleStartDesigning = () => {
        
        router.push('/print-on-demand');
    };


    return (
        <div className="min-h-screen">
            <NavBar />
            
            {/* Hero Section */}
            <header className="relative h-screen flex items-center">
                <div className="absolute inset-0">
                    <img 
                        src="/images/hero-bg.jpg" 
                        alt="Hero Background" 
                        className="w-full h-full object-cover filter brightness-50"
                    />
                </div>
                <div className="container mx-auto px-4 z-10 text-white">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl font-bold mb-6">Create Your Perfect Custom Clothing</h1>
                        <p className="text-xl mb-8">Transform your ideas into unique custom apparel with our easy-to-use design studio.</p>
                        <button 
                            onClick={handleStartDesigning}
                            className="inline-block bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition duration-300 transform hover:scale-105"
                        >
                            Start Designing Now
                        </button>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">Design Tools & Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:transform hover:scale-105 transition duration-300">
                            <FaPencilAlt className="text-5xl text-orange-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-4">Custom Text</h3>
                            <p>Add custom text with various fonts, colors, and effects</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:transform hover:scale-105 transition duration-300">
                            <FaMagic className="text-5xl text-orange-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-4">Art & Emojis</h3>
                            <p>Choose from thousands of art elements and emojis</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:transform hover:scale-105 transition duration-300">
                            <FaTshirt className="text-5xl text-orange-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-4">Multiple Products</h3>
                            <p>Design t-shirts, hoodies, polos, and more</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:transform hover:scale-105 transition duration-300">
                            <FaShippingFast className="text-5xl text-orange-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-4">Fast Delivery</h3>
                            <p>Quick production and worldwide shipping</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* New How It Works Section with Timeline */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
                    <div className="relative">
                        <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-orange-500"></div>
                        <div className="space-y-12">
                            {[
                                { icon: FaPencilAlt, title: "Choose Your Product", description: "Select from our wide range of high-quality clothing items" },
                                { icon: FaMagic, title: "Customize Your Design", description: "Use our intuitive design tools to create your perfect look" },
                                { icon: FaTshirt, title: "Preview Your Creation", description: "See how your design looks before you order" },
                                { icon: FaShippingFast, title: "Place Your Order", description: "We'll carefully produce and ship your custom clothing" }
                            ].map((step, index) => (
                                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                                        <div className="bg-white p-6 rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
                                            <step.icon className="text-4xl text-orange-500 mb-4 mx-auto" />
                                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                            <p className="text-gray-600">{step.description}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 bg-orange-500 rounded-full border-4 border-white absolute left-1/2 transform -translate-x-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* New Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">What Our Customers Say</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Sarah Johnson",
                                role: "Fashion Designer",
                                comment: "The design tools are incredibly intuitive, and the quality of the prints is outstanding!",
                                rating: 5
                            },
                            {
                                name: "Mike Chen",
                                role: "Business Owner",
                                comment: "Perfect for creating custom uniforms for my team. Fast delivery and great customer service!",
                                rating: 5
                            },
                            {
                                name: "Emily Parker",
                                role: "Artist",
                                comment: "I love how I can bring my artwork to life on clothing. The color accuracy is amazing!",
                                rating: 5
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <FaStar key={i} className="text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                                <div className="font-semibold">{testimonial.name}</div>
                                <div className="text-gray-500 text-sm">{testimonial.role}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Statistics Section */}
            <section className="py-20 bg-orange-500 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                        {[
                            { icon: FaUsers, number: "10,000+", label: "Happy Customers" },
                            { icon: FaTshirt, number: "50,000+", label: "Items Printed" },
                            { icon: FaStar, number: "4.9", label: "Average Rating" },
                            { icon: FaComments, number: "24/7", label: "Customer Support" }
                        ].map((stat, index) => (
                            <div key={index} className="transform hover:scale-105 transition duration-300">
                                <stat.icon className="text-5xl mx-auto mb-4" />
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-xl">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Products Showcase */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-bold text-center mb-16">Our Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                            <img src="/images/tshirt-design.jpg" alt="T-Shirt" className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-semibold mb-2">T-Shirts</h3>
                                    <p className="mb-4">Create your custom t-shirt design</p>
                                    <button 
                                        onClick={handleStartDesigning}
                                        className="inline-block bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300"
                                    >
                                        Design Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                            <img src="/images/hoodie-design.jpg" alt="Hoodie" className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-semibold mb-2">Hoodies</h3>
                                    <p className="mb-4">Design your perfect hoodie</p>
                                    <button 
                                        onClick={handleStartDesigning}
                                        className="inline-block bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300"
                                    >
                                        Design Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300">
                            <img src="/images/design-tools.jpg" alt="Design Tools" className="w-full h-80 object-cover transform group-hover:scale-110 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                <div className="p-6 text-white">
                                    <h3 className="text-2xl font-semibold mb-2">Design Studio</h3>
                                    <p className="mb-4">Powerful tools for your creativity</p>
                                    <button 
                                        onClick={handleStartDesigning}
                                        className="inline-block bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition duration-300"
                                    >
                                        Try Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-800 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">About Us</h3>
                            <p className="text-gray-400">Creating unique custom clothing that brings your ideas to life.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <Link href="/print-on-demand" className="hover:text-white">
                                        Design Studio
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/products" className="hover:text-white">
                                        Products
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/pricing" className="hover:text-white">
                                        Pricing
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Contact</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>Email: support@customclothing.com</li>
                                <li>Phone: (555) 123-4567</li>
                                <li>Address: 123 Design Street</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                            <div className="flex">
                                <input type="email" placeholder="Enter your email" className="px-4 py-2 rounded-l-lg w-full" />
                                <button className="bg-orange-500 px-4 py-2 rounded-r-lg hover:bg-orange-600">Subscribe</button>
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-gray-400 border-t border-gray-700 pt-8">
                        <p>&copy; 2024 Custom Clothing Design. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
