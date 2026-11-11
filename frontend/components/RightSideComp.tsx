import React from 'react';
import { FaShoppingCart, FaMinus, FaPlus } from 'react-icons/fa';

interface SizeQuantities {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

interface RightSideCompProps {
  image: any;
  sizeQuantities: SizeQuantities;
  frontPrice: number;
  backPrice: number;
  handleSizeQuantityChange: (size: keyof SizeQuantities, quantity: number) => void;
  getTotalQuantity: () => number;
  handleSS: () => void;
  isLoading?: boolean;
  loadingStatus?: string;
}

const SIZES: (keyof SizeQuantities)[] = ["S", "M", "L", "XL", "XXL"];

const RightSideComp: React.FC<RightSideCompProps> = ({
  image,
  sizeQuantities,
  handleSizeQuantityChange,
  getTotalQuantity,
  handleSS,
  isLoading = false,
}) => {
  const totalQuantity = getTotalQuantity();
  const basePrice = image?.price ? Number(image.price) : 0;

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <span className="inline-block px-2.5 py-1 text-[11px] font-semibold rounded-full bg-purple-100 text-purple-700 uppercase tracking-wide">
          Custom Design
        </span>
        <h2 className="text-xl font-bold text-gray-800 mt-2">
          {image?.title || "Custom T-Shirt"}
        </h2>

        {/* Base style price */}
        {basePrice > 0 && (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">৳{basePrice.toFixed(2)}</span>
            <span className="text-xs text-gray-400">base style price</span>
          </div>
        )}

        {/* Size & Quantity */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">Size &amp; Quantity</h4>
            <span className="text-xs text-gray-400">{totalQuantity} item{totalQuantity === 1 ? '' : 's'}</span>
          </div>

          <div className="space-y-2">
            {SIZES.map((sizeOption) => {
              const qty = sizeQuantities[sizeOption];
              const active = qty > 0;
              return (
                <div
                  key={sizeOption}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all ${
                    active
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className="w-10 text-sm font-bold text-gray-700">{sizeOption}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSizeQuantityChange(sizeOption, Math.max(0, qty - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition"
                      aria-label={`Decrease ${sizeOption}`}
                    >
                      <FaMinus className="w-2.5 h-2.5" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      value={qty}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0) {
                          handleSizeQuantityChange(sizeOption, value);
                        }
                      }}
                      className="w-14 px-2 py-1 text-center text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleSizeQuantityChange(sizeOption, qty + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition"
                      aria-label={`Increase ${sizeOption}`}
                    >
                      <FaPlus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total summary */}
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Total quantity</span>
          <span className="text-2xl font-bold text-orange-600">{totalQuantity}</span>
        </div>

        {/* CTA */}
        <button
          onClick={handleSS}
          disabled={isLoading}
          className={`mt-5 w-full px-6 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            'Processing…'
          ) : (
            <>
              <FaShoppingCart className="w-4 h-4" />
              Add To Cart
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Shipping calculated at checkout
        </p>
      </div>
    </div>
  );
};

export default RightSideComp;
