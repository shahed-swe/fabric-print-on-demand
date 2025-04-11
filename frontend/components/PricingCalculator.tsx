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

  // Calculate bulk discount percentage based on quantity
  const getBulkDiscount = (quantity: number): number => {
    if (quantity >= 100) return 0.20; // 20% discount for 100+ items
    if (quantity >= 50) return 0.15;  // 15% discount for 50+ items
    if (quantity >= 20) return 0.10;  // 10% discount for 20+ items
    if (quantity >= 10) return 0.05;  // 5% discount for 10+ items
    return 0;
  };

  // Calculate style premium
  const getStylePremium = (styleName: string): number => {
    switch (styleName.toLowerCase()) {
      case "hoodie":
        return 300; // Additional 300 for hoodies
      case "long sleeve":
        return 100; // Additional 100 for long sleeves
      case "mens tank":
        return -50; // 50 less for tanks
      default:
        return 0;
    }
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (totalQuantity === 0) return 0;

    const stylePremium = getStylePremium(style);
    const pricePerItem = basePrice + stylePremium;
    const designCost = (frontDesignPrice + backDesignPrice) / Math.max(1, totalQuantity);
    const subtotal = (pricePerItem + designCost) * totalQuantity;
    const discount = getBulkDiscount(totalQuantity);
    const discountAmount = subtotal * discount;

    return subtotal - discountAmount;
  };

  const totalPrice = calculateTotalPrice();
  const pricePerItem = totalQuantity > 0 ? totalPrice / totalQuantity : 0;
  const discount = getBulkDiscount(totalQuantity);

  useEffect(() => {
    setTotalPrice(totalPrice);
  }, [totalPrice, setTotalPrice]);

  return (
    <div className="p-6 ">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Price Breakdown</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Base Price:</span>
          <span>৳{basePrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Style Premium:</span>
          <span>৳{getStylePremium(style).toFixed(2)}</span>
        </div>

        {(frontDesignPrice > 0 || backDesignPrice > 0) && (
          <div className="flex justify-between text-gray-600">
            <span>Design Cost:</span>
            <span>৳{(frontDesignPrice + backDesignPrice).toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Quantity:</span>
          <span>{totalQuantity} pieces</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Bulk Discount:</span>
            <span>-{(discount * 100)}%</span>
          </div>
        )}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-gray-600">
            <span>Price per item:</span>
            <span>৳{pricePerItem.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-orange-500 mt-2">
            <span>Total Price:</span>
            <span>৳{totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {totalQuantity >= 5 && (
          <div className="mt-4 text-sm">
            <div className="text-gray-500">Bulk Discount Tiers:</div>
            <div className="grid grid-cols-2 gap-2 mt-1 text-gray-600">
              <div>10+ pieces: 5% off</div>
              <div>20+ pieces: 10% off</div>
              <div>50+ pieces: 15% off</div>
              <div>100+ pieces: 20% off</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingCalculator;
