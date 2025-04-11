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
}

const RightSideComp: React.FC<RightSideCompProps> = ({
  image,
  sizeQuantities,
  frontPrice,
  backPrice,
  handleSizeQuantityChange,
  getTotalQuantity,
  handleSS
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
            <h4 className="text-lg font-semibold text-gray-700 mb-3">Choose Size & Quantity</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
              {(["S", "M", "L", "XL", "XXL"] as (keyof SizeQuantities)[]).map((sizeOption) => (
                <div
                  key={sizeOption}
                  className={`p-3 border-2 rounded-lg transition-colors ${sizeQuantities[sizeOption] > 0
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">{sizeOption}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSizeQuantityChange(sizeOption, Math.max(0, sizeQuantities[sizeOption] - 1))}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{sizeQuantities[sizeOption]}</span>
                      <button
                        onClick={() => handleSizeQuantityChange(sizeOption, sizeQuantities[sizeOption] + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-right text-sm text-gray-600">
              Total Quantity: {getTotalQuantity()}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSS}
              // disabled={!isAuthenticated}
              // className={`w-full px-6 py-3 rounded-lg transition-colors ${isAuthenticated ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              className={`w-full px-6 py-3 rounded-lg transition-colors bg-green-500 text-white hover:bg-green-600`}
            >
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSideComp;