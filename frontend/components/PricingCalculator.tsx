import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

type TShirtSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';
type SizeQuantities = {
  [key in TShirtSize]: number;
};

interface PricingCalculatorProps {
  basePrice: number;
  sizeQuantities: SizeQuantities;
  frontDesignPrice: number;
  backDesignPrice: number;
  style: string;
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  basePrice,
  sizeQuantities,
  frontDesignPrice,
  backDesignPrice,
  style
}) => {
  const { setTotalPrice } = useAuth();

  // Calculate total quantity
  const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);

  // Fixed pricing: $30 per design
  const DESIGN_PRICE = 30;

  // Calculate total price (without shipping - will be added in cart)
  const calculateTotalPrice = () => {
    if (totalQuantity === 0) return 0;
    
    // $30 per item (shipping will be calculated in cart)
    return DESIGN_PRICE * totalQuantity;
  };

  const totalPrice = calculateTotalPrice();
  const pricePerItem = totalQuantity > 0 ? DESIGN_PRICE : 0;

  useEffect(() => {
    setTotalPrice(totalPrice);
  }, [totalPrice, setTotalPrice]);

  return (
    <div className="p-6 ">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Price Breakdown</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Price per Design:</span>
          <span>${DESIGN_PRICE.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Quantity:</span>
          <span>{totalQuantity} {totalQuantity === 1 ? 'piece' : 'pieces'}</span>
        </div>

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-bold text-lg text-orange-500">
            <span>Subtotal:</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-sm text-gray-500 italic mt-2">
          Shipping cost will be calculated at checkout
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
