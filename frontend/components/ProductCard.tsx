import React from 'react';
import Link from 'next/link';
import { FaStar, FaShoppingCart } from 'react-icons/fa';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    basePrice?: number;
    images?: Array<{ url: string; alt?: string; isPrimary?: boolean }>;
    shortDescription?: string;
    category?: { name: string; slug: string };
    sizes?: Array<{ size: string; stockQuantity: number }>;
    colors?: Array<{ name: string; hexCode: string; stockQuantity: number }>;
    featured?: boolean;
    status?: string;
    material?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const totalStock = product.sizes?.reduce((sum, size) => sum + size.stockQuantity, 0) || 0;
  const isOutOfStock = totalStock === 0;
  const discount = product.basePrice && product.basePrice > product.price 
    ? Math.round(((product.basePrice - product.price) / product.basePrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* Product Image */}
      <Link href={`/products/${product._id}`}>
        <a className="block relative overflow-hidden bg-gray-100">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={primaryImage?.url || 'https://via.placeholder.com/400'}
              alt={primaryImage?.alt || product.name}
              className="w-full h-64 object-cover object-center group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <FaStar className="w-3 h-3" />
                Featured
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded">
                Out of Stock
              </span>
            </div>
          )}
        </a>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link href={`/categories/${product.category.slug}`}>
            <a className="text-xs text-orange-600 hover:text-orange-700 font-medium uppercase tracking-wide">
              {product.category.name}
            </a>
          </Link>
        )}

        {/* Product Name */}
        <Link href={`/products/${product._id}`}>
          <a>
            <h3 className="mt-2 text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2 h-14">
              {product.name}
            </h3>
          </a>
        </Link>

        {/* Description */}
        {product.shortDescription && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Material */}
        {product.material && (
          <p className="mt-1 text-xs text-gray-500">
            {product.material}
          </p>
        )}

        {/* Available Colors */}
        {product.colors && product.colors.length > 0 && (
          <div className="mt-3 flex items-center gap-1">
            <span className="text-xs text-gray-500 mr-1">Colors:</span>
            <div className="flex gap-1">
              {product.colors.slice(0, 5).map((color, idx) => (
                <div
                  key={idx}
                  className="w-5 h-5 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-xs text-gray-500 flex items-center">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Available Sizes */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.sizes.slice(0, 5).map((size, idx) => (
              <span
                key={idx}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {size.size}
              </span>
            ))}
            {product.sizes.length > 5 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{product.sizes.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-4 flex items-center justify-between">
          <div>
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
            {totalStock < 10 && totalStock > 0 && (
              <p className="text-xs text-red-600 font-medium mt-1">
                Only {totalStock} left!
              </p>
            )}
          </div>

          {/* Add to Cart Button */}
          {!isOutOfStock && (
            <Link href={`/products/${product._id}`}>
              <a className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors">
                <FaShoppingCart className="w-5 h-5" />
              </a>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
