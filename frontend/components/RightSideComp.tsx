import React from 'react';
import PricingCalculator from './PricingCalculator';
import { useAuth } from '../context/AuthContext';

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

const RightSideComp: React.FC<RightSideCompProps> = ({
  image,
  sizeQuantities,
  frontPrice,
  backPrice,
  handleSizeQuantityChange,
  getTotalQuantity,
  handleSS,
  isLoading = false,
  loadingStatus = ''
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {image?.title || "Custom T-Shirt"}
        </h2>

        <PricingCalculator
          basePrice={image?.price ? parseInt(image.price) : 500}
          sizeQuantities={sizeQuantities}
          frontDesignPrice={frontPrice}
          backDesignPrice={backPrice}
          style={image?.title || "T-shirt"}
        />

        <div className="space-y-8 mt-8">
          <div className="mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Choose Size & Quantity</h4>
            <div className="grid grid-cols-2 gap-3">
              {(["S", "M", "L", "XL", "XXL"] as (keyof SizeQuantities)[]).map((sizeOption) => (
                <div
                  key={sizeOption}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all"
                >
                  <label className="text-xs font-bold text-gray-700 min-w-fit">{sizeOption}:</label>
                  <input
                    type="number"
                    min="0"
                    max="999"
                    value={sizeQuantities[sizeOption]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (value >= 0) {
                        handleSizeQuantityChange(sizeOption, value);
                      }
                    }}
                    className="w-24 px-3 py-1 text-center text-sm font-bold text-gray-800 bg-white border-2 border-gray-300 rounded focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-center text-sm">
                <span className="font-semibold text-gray-800">Total: </span>
                <span className="text-lg font-bold text-orange-600">{getTotalQuantity()}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSS}
              disabled={isLoading}
              className={`w-full px-6 py-3 rounded-lg transition-colors font-medium text-lg ${
                isLoading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
              }`}
            >
              {isLoading ? 'Processing...' : 'Add To Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideComp;