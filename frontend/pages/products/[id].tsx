import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { productService } from '@/services/product';
import { cartService } from '@/services/cart';
import { useAuth } from '@/context/AuthContext';
import { 
  FaShoppingCart, 
  FaHeart, 
  FaRegHeart, 
  FaStar,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaRulerCombined,
  FaCheck,
  FaMinus,
  FaPlus
} from 'react-icons/fa';

interface Product {
  _id: string;
  name: string;
  price: number;
  basePrice?: number;
  description?: string;
  shortDescription?: string;
  images?: Array<{ url: string; alt?: string; isPrimary?: boolean; sortOrder?: number }>;
  category?: { _id: string; name: string; slug: string };
  subcategory?: string;
  sizes?: Array<{ size: string; stockQuantity: number; enabled: boolean }>;
  colors?: Array<{ name: string; hexCode: string; stockQuantity: number; enabled: boolean }>;
  material?: string;
  weight?: string;
  fit?: string;
  features?: string[];
  careInstructions?: string[];
  printableAreas?: Array<{ name: string; maxWidth: number; maxHeight: number; enabled: boolean }>;
  sizeChart?: {
    measurements: Array<{
      size: string;
      chest: string;
      length: string;
      shoulder: string;
      sleeve: string;
    }>;
  };
  tags?: string[];
  status?: string;
  featured?: boolean;
}

const ProductDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'sizeChart' | 'care'>('description');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProduct(id as string);
      setProduct(data);
      
      // Set the primary image or first image
      const sortedImages = data.images
        ?.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];
      const primaryImg = sortedImages.find((img: any) => img.isPrimary) || sortedImages[0];
      setSelectedImage(primaryImg?.url || '');

      // Auto-select first available size and color
      if (data.sizes && data.sizes.length > 0) {
        const availableSize = data.sizes.find((s: any) => s.enabled && s.stockQuantity > 0);
        if (availableSize) setSelectedSize(availableSize.size);
      }
      if (data.colors && data.colors.length > 0) {
        const availableColor = data.colors.find((c: any) => c.enabled && c.stockQuantity > 0);
        if (availableColor) setSelectedColor(availableColor.name);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    if (product?.colors && product.colors.length > 0 && !selectedColor) {
      alert('Please select a color');
      return;
    }

    try {
      setAddingToCart(true);
      await cartService.addToCart(
        product!._id,
        quantity,
        selectedSize,
        selectedColor
      );
      alert('Product added to cart!');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      alert(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getTotalStock = () => {
    if (!product) return 0;
    return product.sizes?.reduce((sum, size) => sum + (size.enabled ? size.stockQuantity : 0), 0) || 0;
  };

  const getDiscount = () => {
    if (!product?.basePrice || !product?.price) return 0;
    return product.basePrice > product.price 
      ? Math.round(((product.basePrice - product.price) / product.basePrice) * 100)
      : 0;
  };

  const sortedImages = product?.images
    ?.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) || [];

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <Link href="/products">
              <a className="text-orange-600 hover:text-orange-700">Browse all products</a>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const isOutOfStock = getTotalStock() === 0;
  const discount = getDiscount();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/"><a className="hover:text-orange-600">Home</a></Link></li>
            <li>/</li>
            <li><Link href="/products"><a className="hover:text-orange-600">Products</a></Link></li>
            {product.category && (
              <>
                <li>/</li>
                <li>
                  <Link href={`/categories/${product.category.slug}`}>
                    <a className="hover:text-orange-600">{product.category.name}</a>
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image Canvas */}
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
              <img
                src={selectedImage || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FaStar className="w-3 h-3" />
                    Featured
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{discount}% OFF
                  </span>
                )}
              </div>

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="bg-white text-gray-800 text-lg font-bold px-6 py-3 rounded">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {sortedImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {sortedImages.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(image.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image.url
                        ? 'border-orange-500 ring-2 ring-orange-200'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} - Image ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Category */}
            <div>
              {product.category && (
                <Link href={`/categories/${product.category.slug}`}>
                  <a className="text-sm text-orange-600 hover:text-orange-700 font-medium uppercase tracking-wide">
                    {product.category.name}
                  </a>
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
              {product.subcategory && (
                <p className="text-sm text-gray-600 mt-1">{product.subcategory}</p>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-700 text-lg">{product.shortDescription}</p>
            )}

            {/* Price */}
            <div className="border-t border-b border-gray-200 py-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.basePrice && product.basePrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.basePrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-lg text-green-600 font-semibold">
                    Save {discount}%
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">Tax included. Shipping calculated at checkout.</p>
            </div>

            {/* Material & Fit */}
            {(product.material || product.weight || product.fit) && (
              <div className="flex flex-wrap gap-4 text-sm">
                {product.material && (
                  <div>
                    <span className="text-gray-600">Material:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.material}</span>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <span className="text-gray-600">Weight:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.weight}</span>
                  </div>
                )}
                {product.fit && (
                  <div>
                    <span className="text-gray-600">Fit:</span>
                    <span className="ml-2 font-medium text-gray-900">{product.fit}</span>
                  </div>
                )}
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Color: {selectedColor && <span className="text-orange-600">{selectedColor}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => color.enabled && color.stockQuantity > 0 && setSelectedColor(color.name)}
                      disabled={!color.enabled || color.stockQuantity === 0}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? 'border-orange-500 ring-2 ring-orange-200 scale-110'
                          : 'border-gray-300 hover:border-orange-300'
                      } ${(!color.enabled || color.stockQuantity === 0) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      style={{ backgroundColor: color.hexCode }}
                      title={`${color.name}${(!color.enabled || color.stockQuantity === 0) ? ' (Out of stock)' : ''}`}
                    >
                      {selectedColor === color.name && (
                        <FaCheck className="absolute inset-0 m-auto text-white drop-shadow-lg" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Size: {selectedSize && <span className="text-orange-600">{selectedSize}</span>}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, idx) => (
                    <button
                      key={idx}
                      onClick={() => size.enabled && size.stockQuantity > 0 && setSelectedSize(size.size)}
                      disabled={!size.enabled || size.stockQuantity === 0}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size.size
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 text-gray-700 hover:border-orange-300'
                      } ${(!size.enabled || size.stockQuantity === 0) ? 'opacity-30 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                    >
                      {size.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <FaMinus className="w-3 h-3 text-gray-600" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaPlus className="w-3 h-3 text-gray-600" />
                </button>
                {getTotalStock() < 10 && getTotalStock() > 0 && (
                  <span className="text-sm text-red-600 font-medium ml-2">
                    Only {getTotalStock()} left in stock!
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart || !selectedSize}
                className="flex-1 bg-orange-500 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaShoppingCart />
                {addingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-14 h-14 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                {isFavorite ? (
                  <FaHeart className="w-6 h-6 text-red-500" />
                ) : (
                  <FaRegHeart className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-start gap-3">
                <FaTruck className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Free Shipping</h4>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaUndo className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Easy Returns</h4>
                  <p className="text-xs text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FaShieldAlt className="w-5 h-5 text-orange-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Secure Payment</h4>
                  <p className="text-xs text-gray-600">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="border-t border-gray-200 pt-8">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'description'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                activeTab === 'specifications'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Specifications
            </button>
            {product.sizeChart && product.sizeChart.measurements && product.sizeChart.measurements.length > 0 && (
              <button
                onClick={() => setActiveTab('sizeChart')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'sizeChart'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FaRulerCombined className="inline mr-2" />
                Size Chart
              </button>
            )}
            {product.careInstructions && product.careInstructions.length > 0 && (
              <button
                onClick={() => setActiveTab('care')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'care'
                    ? 'border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Care Instructions
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl">
            {activeTab === 'description' && (
              <div className="prose prose-orange max-w-none">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p className="text-gray-700">{product.shortDescription || 'No description available.'}</p>
                )}
                
                {product.features && product.features.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <FaCheck className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.material && (
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm font-medium text-gray-600">Material</span>
                    <p className="text-gray-900 mt-1">{product.material}</p>
                  </div>
                )}
                {product.weight && (
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm font-medium text-gray-600">Weight</span>
                    <p className="text-gray-900 mt-1">{product.weight}</p>
                  </div>
                )}
                {product.fit && (
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm font-medium text-gray-600">Fit</span>
                    <p className="text-gray-900 mt-1">{product.fit}</p>
                  </div>
                )}
                {product.subcategory && (
                  <div className="border-b border-gray-200 pb-3">
                    <span className="text-sm font-medium text-gray-600">Category</span>
                    <p className="text-gray-900 mt-1">{product.subcategory}</p>
                  </div>
                )}
                {product.printableAreas && product.printableAreas.length > 0 && (
                  <div className="border-b border-gray-200 pb-3 md:col-span-2">
                    <span className="text-sm font-medium text-gray-600">Printable Areas</span>
                    <ul className="mt-2 space-y-1">
                      {product.printableAreas.filter(area => area.enabled).map((area, idx) => (
                        <li key={idx} className="text-gray-900">
                          {area.name}: {area.maxWidth}" × {area.maxHeight}"
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sizeChart' && product.sizeChart && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chest (in)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Length (in)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shoulder (in)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sleeve (in)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {product.sizeChart.measurements.map((measurement, idx) => (
                      <tr key={idx} className={selectedSize === measurement.size ? 'bg-orange-50' : ''}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{measurement.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{measurement.chest}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{measurement.length}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{measurement.shoulder}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{measurement.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'care' && product.careInstructions && (
              <ul className="space-y-2">
                {product.careInstructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <FaCheck className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetails;
