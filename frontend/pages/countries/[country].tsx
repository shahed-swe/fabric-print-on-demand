import { formatBDT } from '../../utils/currency';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Product interface for TypeScript type safety
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  material: string;
}

// Dummy products data
const dummyProducts: Product[] = [
  {
    id: 1,
    name: 'Floral Print Fabric',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1590422405310-11641013a0dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.5,
    reviews: 128,
    material: 'Cotton'
  },
  {
    id: 2,
    name: 'Abstract Pattern Textile',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1528459061998-56fd57ad86e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.2,
    reviews: 87,
    material: 'Polyester'
  },
  {
    id: 3,
    name: 'Premium Cotton Blend',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.8,
    reviews: 215,
    material: 'Cotton'
  },
  {
    id: 4,
    name: 'Geometric Design Fabric',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1579493933704-420751d7b88f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.3,
    reviews: 145,
    material: 'Polyester'
  },
  {
    id: 5,
    name: 'Vintage Lace Material',
    price: 27.50,
    image: 'https://images.unsplash.com/photo-1573495627361-d9b87960b12d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.7,
    reviews: 192,
    material: 'Cotton'
  },
  {
    id: 6,
    name: 'Denim Textile',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1596149615493-f0739de31c2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.0,
    reviews: 76,
    material: 'Denim'
  },
  {
    id: 7,
    name: 'Silk Brocade Fabric',
    price: 42.99,
    image: 'https://images.unsplash.com/photo-1594379351152-02bea0ccc82a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.9,
    reviews: 183,
    material: 'Silk'
  },
  {
    id: 8,
    name: 'Organic Linen Material',
    price: 36.50,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.6,
    reviews: 109,
    material: 'Linen'
  },
  {
    id: 9,
    name: 'Velvet Upholstery Fabric',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.7,
    reviews: 156,
    material: 'Velvet'
  },
  {
    id: 10,
    name: 'Watercolor Print Cotton',
    price: 26.99,
    image: 'https://images.unsplash.com/photo-1528459034640-9eee1441105d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.3,
    reviews: 98,
    material: 'Cotton'
  },
  {
    id: 11,
    name: 'Striped Jersey Knit',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.1,
    reviews: 67,
    material: 'Polyester'
  },
  {
    id: 12,
    name: 'Hand-dyed Batik Fabric',
    price: 32.50,
    image: 'https://images.unsplash.com/photo-1595515106864-077d30192c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    rating: 4.8,
    reviews: 142,
    material: 'Cotton'
  },
];

const CountryProducts = () => {
  const router = useRouter();
  const { country } = router.query;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!country) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products`, {
          params: { country }
        });
        const productsData = response.data.length > 0 ? response.data : dummyProducts;
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error(error);
        setProducts(dummyProducts); // Use dummy data if API fails
        setFilteredProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [country]);

  // Apply filters and sorting whenever filter criteria changes
  useEffect(() => {
    let result = [...products];
    
    // Filter by materials if any are selected
    if (selectedMaterials.length > 0) {
      result = result.filter(product => selectedMaterials.includes(product.material));
    }
    
    // Filter by price range
    result = result.filter(product => product.price <= priceRange[1]);
    
    // Apply sorting
    switch(sortBy) {
      case 'price_low_high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high_low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
      default: // 'recommended' - could be a mix of factors
        result.sort((a, b) => (b.rating * 0.6 + b.reviews * 0.4) - (a.rating * 0.6 + a.reviews * 0.4));
    }
    
    setFilteredProducts(result);
  }, [products, selectedMaterials, priceRange, sortBy]);

  // Function to render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400' 
                : i < rating 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
            }`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 22 20"
          >
            <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating} | {products[0]?.reviews} reviews)</span>
      </div>
    );
  };

  // Filter options for fabrics
  const materialOptions = ['Cotton', 'Silk', 'Linen', 'Wool', 'Polyester', 'Velvet', 'Denim'];
  
  const handleMaterialChange = (material: string) => {
    if (selectedMaterials.includes(material)) {
      setSelectedMaterials(selectedMaterials.filter(m => m !== material));
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (e.target.name === 'min') {
      setPriceRange([value, priceRange[1]]);
    } else {
      setPriceRange([priceRange[0], value]);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      {country && (
        <h1 className="text-3xl font-bold mb-6 text-gray-800 capitalize">
          {typeof country === 'string' ? country.toLowerCase().replaceAll('-', ' ') : ''} Collection
        </h1>
      )}
      
      {/* Filter Section */}
      <div className="bg-white p-4 mb-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="w-full md:w-5/12">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Material</h3>
            <div className="flex flex-wrap gap-2">
              {materialOptions.map((material) => (
                <button
                  key={material}
                  onClick={() => handleMaterialChange(material)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                    selectedMaterials.includes(material) 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-4/12">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Price Range: {formatBDT(priceRange[0])} - {formatBDT(priceRange[1])}</h3>
            <div className="px-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={priceRange[1]} 
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatBDT(0)}</span>
                <span>{formatBDT(50)}</span>
                <span>{formatBDT(100)}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/12">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Sort By</h3>
            <div className="relative">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="block appearance-none w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight text-sm focus:outline-none focus:bg-white focus:border-orange-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popularity">Most Popular</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {(selectedMaterials.length > 0 || priceRange[0] > 0 || priceRange[1] < 100) && (
          <div className="mt-4 flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {selectedMaterials.map((material) => (
                <div key={material} className="bg-gray-50 px-3 py-1 rounded-full flex items-center">
                  <span className="text-xs">{material}</span>
                  <button 
                    onClick={() => handleMaterialChange(material)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Remove</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                setSelectedMaterials([]);
                setPriceRange([0, 100]);
                setSortBy('recommended');
              }}
              className="text-orange-500 hover:underline text-xs"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-semibold text-gray-700">No products found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your filters to find what you're looking for.</p>
          <button 
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
            onClick={() => {
              setSelectedMaterials([]);
              setPriceRange([0, 100]);
              setSortBy('recommended');
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg">
              <div className="relative h-64 overflow-hidden group">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="bg-white text-gray-800 px-4 py-2 rounded-full font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    Quick View
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h2>
                <p className="text-sm text-gray-600 mb-1">{product.material}</p>
                <div className="mb-2">
                  {renderRatingStars(product.rating)}
                </div>
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xl font-bold text-black">{formatBDT(product.price)}</p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors duration-300">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CountryProducts;
