import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import { FaPencilAlt, FaTshirt, FaMagic, FaShippingFast, FaUsers, FaStar, FaComments, FaHeart, FaCartPlus } from 'react-icons/fa';
import { FaRegHeart } from 'react-icons/fa';

import { useRouter } from 'next/router';
import { productService } from '../services/product';
import { cartService } from '../services/cart';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  basePrice?: number;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
  shortDescription?: string;
  category?: { name: string; slug: string };
  featured?: boolean;
  sizes?: Array<{ size: string; stockQuantity: number }>;
  colors?: Array<{ name: string; hexCode: string }>;
}

const LandingPage = () => {

    const router = useRouter();
    const { user } = useAuth();
    const { incrementCart } = useCart();
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [addedToCart, setAddedToCart] = useState<string | null>(null);
    const [reviewSlide, setReviewSlide] = useState(0);

    useEffect(() => {
        fetchFeaturedProducts();
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
    }, []);

    // Auto-play carousel - automatically changes every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setReviewSlide((prev) => (prev + 1) % 6);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const response = await productService.getAllProducts({ 
                page: 1,
                limit: 6, 
                status: 'active',
                sortBy: 'newest'
            });
            setFeaturedProducts(response.products || response.data || response);
        } catch (error) {
            console.error('Error fetching featured products:', error);
            // Fallback: fetch all active products
            try {
                const response = await productService.getAllProducts({ 
                    page: 1,
                    limit: 6,
                    status: 'active',
                    sortBy: 'newest'
                });
                setFeaturedProducts(response.products || response.data || response);
            } catch (fallbackError) {
                console.error('Error fetching products:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleStartDesigning = () => {
        
        router.push('/print-on-demand');
    };

    const toggleWishlist = (productId: string) => {
        const updatedWishlist = wishlist.includes(productId)
            ? wishlist.filter(id => id !== productId)
            : [...wishlist, productId];
        setWishlist(updatedWishlist);
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    };

    const handleQuickBuy = async (product: Product) => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            await cartService.addToCart(
                user._id,
                'product',
                product._id,
                1,
                product.price,
                product.sizes?.[0]?.size || 'M',
                product.colors?.[0]?.name || 'Black'
            );
            setAddedToCart(product._id);
            incrementCart();
            setTimeout(() => setAddedToCart(null), 2000);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <NavBar />
            
            {/* Hero Section - Modern Gradient */}
            <header className="relative h-screen flex items-center overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-pink-500">
                {/* Animated Background Shapes */}
                <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
                
                <div className="container mx-auto px-4 z-10 text-white">
                    <div className="max-w-3xl animate-fade-in">
                        <div className="inline-block mb-6 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold">
                            ✨ Design & Print Anything
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
                            Create Your <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">Perfect</span> Custom Clothing
                        </h1>
                        <p className="text-2xl mb-10 text-white/90 leading-relaxed">Turn your wildest ideas into stunning custom apparel. Easy design tools, premium quality, lightning-fast delivery.</p>
                        <div className="flex flex-col md:flex-row gap-4">
                            <button 
                                onClick={handleStartDesigning}
                                className="inline-block bg-white text-orange-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition duration-300 transform hover:scale-105 shadow-2xl"
                            >
                                Start Designing Now
                            </button>
                            <Link href="/products">
                                <a className="inline-block bg-white/20 backdrop-blur-md text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white/30 transition duration-300 border-2 border-white/50">
                                    Browse Products →
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section - Modern Cards */}
            <section className="py-32 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">Powerful Design Tools</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to create stunning custom apparel</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: FaPencilAlt, title: "Custom Text", desc: "Add text with 100+ fonts, colors, and effects", color: "from-blue-500 to-blue-600" },
                            { icon: FaMagic, title: "Art & Emojis", desc: "Access thousands of designs and emojis", color: "from-purple-500 to-purple-600" },
                            { icon: FaTshirt, title: "Multiple Products", desc: "T-shirts, hoodies, polos, and more", color: "from-pink-500 to-pink-600" },
                            { icon: FaShippingFast, title: "Fast Delivery", desc: "Quick production with worldwide shipping", color: "from-green-500 to-green-600" }
                        ].map((feature, idx) => (
                            <div key={idx} className={`group bg-gradient-to-br ${feature.color} p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-white`}>
                                <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                    <feature.icon className="text-3xl" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-white/90">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section - Modern Timeline */}
            <section className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-black mb-6">How It Works</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">4 Simple Steps to Your Perfect Custom Apparel</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { num: "01", icon: FaTshirt, title: "Choose Your Product", description: "Select from our wide range of premium clothing items" },
                            { num: "02", icon: FaPencilAlt, title: "Customize Your Design", description: "Use our intuitive drag-and-drop design tools" },
                            { num: "03", icon: FaStar, title: "Preview & Review", description: "See exactly how your design looks on the product" },
                            { num: "04", icon: FaShippingFast, title: "Order & Receive", description: "We produce and ship your order quickly worldwide" }
                        ].map((step, index) => (
                            <div key={index} className="relative">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl hover:bg-white/20 transition duration-300 group">
                                    <div className="text-6xl font-black text-orange-500/50 mb-4">{step.num}</div>
                                    <div className="bg-gradient-to-br from-orange-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                                        <step.icon className="text-2xl text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-gray-300 text-sm">{step.description}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full border-4 border-gray-900"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Carousel */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">Loved by Thousands</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">See what our customers have to say about their experience</p>
                    </div>

                    {/* Testimonials Carousel */}
                    <div className="max-w-6xl mx-auto">
                        {/* Main Carousel */}
                        <div className="relative bg-gradient-to-br from-gray-50 to-white p-12 rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                                {/* Left side - Testimonial Content */}
                                <div className="flex-1 md:pr-8">
                                    <div className="flex gap-1 mb-6">
                                        {[...Array([
                                            {
                                                name: "Sarah Johnson",
                                                role: "Fashion Designer",
                                                comment: "The design tools are incredibly intuitive, and the quality of the prints is outstanding! I've recommended this to all my designer friends.",
                                                rating: 5,
                                                avatar: "🎨"
                                            },
                                            {
                                                name: "Mike Chen",
                                                role: "Business Owner",
                                                comment: "Perfect for creating custom uniforms for my team. Fast delivery and great customer service! Orders always arrive on time.",
                                                rating: 5,
                                                avatar: "💼"
                                            },
                                            {
                                                name: "Emily Parker",
                                                role: "Artist",
                                                comment: "I love how I can bring my artwork to life on clothing. The color accuracy is amazing! Best printing service ever.",
                                                rating: 5,
                                                avatar: "👩‍🎨"
                                            },
                                            {
                                                name: "David Rodriguez",
                                                role: "Entrepreneur",
                                                comment: "Started my merchandise business using this platform. The quality and customer support are unmatched. Highly recommend!",
                                                rating: 5,
                                                avatar: "🚀"
                                            },
                                            {
                                                name: "Lisa Thompson",
                                                role: "Event Organizer",
                                                comment: "Used it for our company event t-shirts. The turnaround time was incredibly fast and the quality exceeded expectations!",
                                                rating: 5,
                                                avatar: "🎉"
                                            },
                                            {
                                                name: "James Wilson",
                                                role: "Creative Director",
                                                comment: "The design tools are professional-grade. We've produced over 500 custom items and every single one has been perfect.",
                                                rating: 5,
                                                avatar: "✨"
                                            }
                                        ][reviewSlide]?.rating)].map((_, i) => (
                                            <FaStar key={i} className="text-yellow-400 text-2xl" />
                                        ))}
                                    </div>
                                    
                                    <p className="text-2xl text-gray-800 mb-8 italic leading-relaxed">
                                        "{[
                                            {
                                                name: "Sarah Johnson",
                                                role: "Fashion Designer",
                                                comment: "The design tools are incredibly intuitive, and the quality of the prints is outstanding! I've recommended this to all my designer friends.",
                                                rating: 5,
                                                avatar: "🎨"
                                            },
                                            {
                                                name: "Mike Chen",
                                                role: "Business Owner",
                                                comment: "Perfect for creating custom uniforms for my team. Fast delivery and great customer service! Orders always arrive on time.",
                                                rating: 5,
                                                avatar: "💼"
                                            },
                                            {
                                                name: "Emily Parker",
                                                role: "Artist",
                                                comment: "I love how I can bring my artwork to life on clothing. The color accuracy is amazing! Best printing service ever.",
                                                rating: 5,
                                                avatar: "👩‍🎨"
                                            },
                                            {
                                                name: "David Rodriguez",
                                                role: "Entrepreneur",
                                                comment: "Started my merchandise business using this platform. The quality and customer support are unmatched. Highly recommend!",
                                                rating: 5,
                                                avatar: "🚀"
                                            },
                                            {
                                                name: "Lisa Thompson",
                                                role: "Event Organizer",
                                                comment: "Used it for our company event t-shirts. The turnaround time was incredibly fast and the quality exceeded expectations!",
                                                rating: 5,
                                                avatar: "🎉"
                                            },
                                            {
                                                name: "James Wilson",
                                                role: "Creative Director",
                                                comment: "The design tools are professional-grade. We've produced over 500 custom items and every single one has been perfect.",
                                                rating: 5,
                                                avatar: "✨"
                                            }
                                        ][reviewSlide]?.comment}"
                                    </p>

                                    <div className="border-l-4 border-orange-500 pl-6">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {[
                                                {
                                                    name: "Sarah Johnson",
                                                    role: "Fashion Designer",
                                                    comment: "The design tools are incredibly intuitive, and the quality of the prints is outstanding! I've recommended this to all my designer friends.",
                                                    rating: 5,
                                                    avatar: "🎨"
                                                },
                                                {
                                                    name: "Mike Chen",
                                                    role: "Business Owner",
                                                    comment: "Perfect for creating custom uniforms for my team. Fast delivery and great customer service! Orders always arrive on time.",
                                                    rating: 5,
                                                    avatar: "💼"
                                                },
                                                {
                                                    name: "Emily Parker",
                                                    role: "Artist",
                                                    comment: "I love how I can bring my artwork to life on clothing. The color accuracy is amazing! Best printing service ever.",
                                                    rating: 5,
                                                    avatar: "👩‍🎨"
                                                },
                                                {
                                                    name: "David Rodriguez",
                                                    role: "Entrepreneur",
                                                    comment: "Started my merchandise business using this platform. The quality and customer support are unmatched. Highly recommend!",
                                                    rating: 5,
                                                    avatar: "🚀"
                                                },
                                                {
                                                    name: "Lisa Thompson",
                                                    role: "Event Organizer",
                                                    comment: "Used it for our company event t-shirts. The turnaround time was incredibly fast and the quality exceeded expectations!",
                                                    rating: 5,
                                                    avatar: "🎉"
                                                },
                                                {
                                                    name: "James Wilson",
                                                    role: "Creative Director",
                                                    comment: "The design tools are professional-grade. We've produced over 500 custom items and every single one has been perfect.",
                                                    rating: 5,
                                                    avatar: "✨"
                                                }
                                            ][reviewSlide]?.name}
                                        </div>
                                        <div className="text-orange-600 font-semibold text-lg">
                                            {[
                                                {
                                                    name: "Sarah Johnson",
                                                    role: "Fashion Designer",
                                                    comment: "The design tools are incredibly intuitive, and the quality of the prints is outstanding! I've recommended this to all my designer friends.",
                                                    rating: 5,
                                                    avatar: "🎨"
                                                },
                                                {
                                                    name: "Mike Chen",
                                                    role: "Business Owner",
                                                    comment: "Perfect for creating custom uniforms for my team. Fast delivery and great customer service! Orders always arrive on time.",
                                                    rating: 5,
                                                    avatar: "💼"
                                                },
                                                {
                                                    name: "Emily Parker",
                                                    role: "Artist",
                                                    comment: "I love how I can bring my artwork to life on clothing. The color accuracy is amazing! Best printing service ever.",
                                                    rating: 5,
                                                    avatar: "👩‍🎨"
                                                },
                                                {
                                                    name: "David Rodriguez",
                                                    role: "Entrepreneur",
                                                    comment: "Started my merchandise business using this platform. The quality and customer support are unmatched. Highly recommend!",
                                                    rating: 5,
                                                    avatar: "🚀"
                                                },
                                                {
                                                    name: "Lisa Thompson",
                                                    role: "Event Organizer",
                                                    comment: "Used it for our company event t-shirts. The turnaround time was incredibly fast and the quality exceeded expectations!",
                                                    rating: 5,
                                                    avatar: "🎉"
                                                },
                                                {
                                                    name: "James Wilson",
                                                    role: "Creative Director",
                                                    comment: "The design tools are professional-grade. We've produced over 500 custom items and every single one has been perfect.",
                                                    rating: 5,
                                                    avatar: "✨"
                                                }
                                            ][reviewSlide]?.role}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side - Avatar and Dots */}
                                <div className="flex flex-col items-center gap-8 md:w-40">
                                    <div className="text-8xl animate-bounce">
                                        {[
                                            {
                                                name: "Sarah Johnson",
                                                role: "Fashion Designer",
                                                comment: "The design tools are incredibly intuitive, and the quality of the prints is outstanding! I've recommended this to all my designer friends.",
                                                rating: 5,
                                                avatar: "🎨"
                                            },
                                            {
                                                name: "Mike Chen",
                                                role: "Business Owner",
                                                comment: "Perfect for creating custom uniforms for my team. Fast delivery and great customer service! Orders always arrive on time.",
                                                rating: 5,
                                                avatar: "💼"
                                            },
                                            {
                                                name: "Emily Parker",
                                                role: "Artist",
                                                comment: "I love how I can bring my artwork to life on clothing. The color accuracy is amazing! Best printing service ever.",
                                                rating: 5,
                                                avatar: "👩‍🎨"
                                            },
                                            {
                                                name: "David Rodriguez",
                                                role: "Entrepreneur",
                                                comment: "Started my merchandise business using this platform. The quality and customer support are unmatched. Highly recommend!",
                                                rating: 5,
                                                avatar: "🚀"
                                            },
                                            {
                                                name: "Lisa Thompson",
                                                role: "Event Organizer",
                                                comment: "Used it for our company event t-shirts. The turnaround time was incredibly fast and the quality exceeded expectations!",
                                                rating: 5,
                                                avatar: "🎉"
                                            },
                                            {
                                                name: "James Wilson",
                                                role: "Creative Director",
                                                comment: "The design tools are professional-grade. We've produced over 500 custom items and every single one has been perfect.",
                                                rating: 5,
                                                avatar: "✨"
                                            }
                                        ][reviewSlide]?.avatar}
                                    </div>

                                    {/* Dot Indicators - Auto play only */}
                                    <div className="flex gap-2 justify-center flex-wrap w-full">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <div
                                                key={index}
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    reviewSlide === index 
                                                        ? 'bg-orange-500 w-8' 
                                                        : 'bg-gray-300 w-2'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Auto-playing carousel - no manual controls */}
                    </div>
                </div>
            </section>

            {/* Statistics Section - Modern */}
            <section className="py-32 bg-gradient-to-r from-orange-600 to-pink-600 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: FaUsers, number: "10,000+", label: "Happy Customers", sub: "and counting" },
                            { icon: FaTshirt, number: "50,000+", label: "Items Printed", sub: "with love" },
                            { icon: FaStar, number: "4.9/5", label: "Average Rating", sub: "from reviews" },
                            { icon: FaComments, number: "24/7", label: "Customer Support", sub: "always ready" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center group">
                                <div className="bg-white/20 backdrop-blur-md w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition duration-300">
                                    <stat.icon className="text-4xl" />
                                </div>
                                <div className="text-5xl md:text-6xl font-black mb-2">{stat.number}</div>
                                <div className="text-2xl font-bold mb-1">{stat.label}</div>
                                <div className="text-white/70 text-sm">{stat.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section - Ready to Buy */}
            <section className="py-32 bg-gradient-to-br from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-20">
                        <div className="inline-block mb-6 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold">⚡ SPECIAL OFFER</div>
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900">Trending Now</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Check out our best-selling products or customize them with your unique designs</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="inline-block">
                                <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                            </div>
                        </div>
                    ) : featuredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredProducts.map((product) => {
                                const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                                const discount = product.basePrice && product.basePrice > product.price 
                                    ? Math.round(((product.basePrice - product.price) / product.basePrice) * 100)
                                    : 0;
                                const isInWishlist = wishlist.includes(product._id);

                                return (
                                    <div key={product._id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-gray-100">
                                        {/* Image Container */}
                                        <div className="relative overflow-hidden bg-gray-100 h-80">
                                            <img
                                                src={primaryImage?.url || 'https://via.placeholder.com/400'}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                                            />
                                            
                                            
                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                {discount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                        -{discount}% OFF
                                                    </span>
                                                )}
                                                {product.featured && (
                                                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                        <FaStar className="w-3 h-3" />
                                                        Featured
                                                    </span>
                                                )}
                                            </div>

                                            {/* Wishlist Button */}
                                            <button
                                                onClick={() => toggleWishlist(product._id)}
                                                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                                            >
                                                {isInWishlist ? (
                                                    <FaHeart className="text-red-500 w-5 h-5" />
                                                ) : (
                                                    <FaRegHeart className="text-gray-400 w-5 h-5 hover:text-red-500" />
                                                )}
                                            </button>

                                            {/* Overlay with Actions */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                                                <button
                                                    onClick={() => router.push(`/products/${product._id}`)}
                                                    className="bg-white text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition duration-300"
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => handleQuickBuy(product)}
                                                    className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition duration-300 flex items-center gap-2"
                                                >
                                                    <FaCartPlus className="w-4 h-4" />
                                                    {addedToCart === product._id ? 'Added!' : 'Quick Buy'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-6">
                                            {/* Category */}
                                            {product.category && (
                                                <div className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-2">
                                                    {product.category.name}
                                                </div>
                                            )}

                                            {/* Product Name */}
                                            <Link href={`/products/${product._id}`}>
                                                <a className="block text-xl font-bold text-gray-800 hover:text-orange-600 transition duration-300 mb-2 line-clamp-2">
                                                    {product.name}
                                                </a>
                                            </Link>

                                            {/* Short Description */}
                                            {product.shortDescription && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                                    {product.shortDescription}
                                                </p>
                                            )}

                                            {/* Price */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-2xl font-bold text-gray-900">
                                                        ${product.price.toFixed(2)}
                                                    </span>
                                                    {product.basePrice && product.basePrice > product.price && (
                                                        <span className="text-sm text-gray-500 line-through">
                                                            ${product.basePrice.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 mt-6">
                                                <button
                                                    onClick={() => handleQuickBuy(product)}
                                                    className={`flex-1 py-2 rounded-lg font-semibold transition duration-300 flex items-center justify-center gap-2 ${
                                                        addedToCart === product._id
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                                    }`}
                                                >
                                                    <FaCartPlus className="w-4 h-4" />
                                                    {addedToCart === product._id ? 'Added!' : 'Add to Cart'}
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/products/${product._id}`)}
                                                    className="flex-1 py-2 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600 transition duration-300"
                                                >
                                                    Customize
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-xl text-gray-500 mb-8">No products available yet. Check back soon!</p>
                            <button 
                                onClick={handleStartDesigning}
                                className="inline-block bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition duration-300"
                            >
                                Start Designing
                            </button>
                        </div>
                    )}

                    {/* View All Products Link */}
                    {featuredProducts.length > 0 && (
                        <div className="text-center mt-12">
                            <Link href="/products">
                                <a className="inline-block bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 transition duration-300">
                                    View All Products →
                                </a>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-20 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                
                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div>
                            <h3 className="text-2xl font-black mb-6 text-white">CustomPrint</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">Creating unique custom clothing that brings your wildest ideas to life with premium quality and fast delivery.</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition duration-300">f</a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition duration-300">𝕏</a>
                                <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition duration-300">📷</a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-6">Product</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li><Link href="/print-on-demand"><a className="hover:text-orange-500 transition duration-300">Design Studio</a></Link></li>
                                <li><Link href="/products"><a className="hover:text-orange-500 transition duration-300">Browse Products</a></Link></li>
                                <li><a href="#" className="hover:text-orange-500 transition duration-300">Pricing</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition duration-300">How It Works</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-6">Company</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li><a href="#" className="hover:text-orange-500 transition duration-300">About Us</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition duration-300">Blog</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition duration-300">Careers</a></li>
                                <li><a href="#" className="hover:text-orange-500 transition duration-300">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-6">Stay Updated</h3>
                            <p className="text-gray-400 mb-4">Get the latest designs and offers delivered to your inbox</p>
                            <div className="flex">
                                <input type="email" placeholder="Your email" className="px-4 py-3 rounded-l-lg w-full text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                <button className="bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-3 rounded-r-lg hover:shadow-lg transition duration-300 font-semibold">→</button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 pt-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-gray-500 text-sm">&copy; 2024 CustomPrint. All rights reserved.</p>
                            <div className="flex gap-6 text-sm text-gray-500">
                                <a href="#" className="hover:text-orange-500 transition duration-300">Privacy Policy</a>
                                <a href="#" className="hover:text-orange-500 transition duration-300">Terms of Service</a>
                                <a href="#" className="hover:text-orange-500 transition duration-300">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
