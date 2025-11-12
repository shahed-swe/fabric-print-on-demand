import { useEffect, useState } from 'react';
import api from '../config/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { FaTrash, FaDownload } from 'react-icons/fa';
import CheckoutForm from '../components/CheckoutForm';
import { toast } from 'react-toastify';
import ShippingAddressForm from '../components/ShippingAddressForm';
import { cartService } from '../services/cart';
import { orderService } from '../services/order';
import { shippingService } from '../services/shipping';
import axios from 'axios';

// Initialize Stripe
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('Stripe publishable key is missing. Please check your environment variables.');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);

  useEffect(() => {
  const fetchCartItems = async () => {
    if (!user?._id) return; 
    try {
      const items = await cartService.getCartItems(user._id);
      setCartItems(items);
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      toast.error(error.message || 'Failed to load cart items');
    }
  };

  fetchCartItems();
}, [user]);

  const handleRemoveItem = async (id: string) => {
    try {
      await cartService.removeFromCart(id);
      setCartItems(cartItems.filter(item => item._id !== id));
      toast.success('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error removing item');
    }
  };

  const getStylePremium = (styleName: string): number => {
    switch (styleName.toLowerCase()) {
      case "hoodie":
        return 300;
      case "long sleeve":
        return 100;
      case "mens tank":
        return -50;
      default:
        return 0;
    }
  };

  const getBulkDiscount = (quantity: number): number => {
    if (quantity >= 100) return 0.20;
    if (quantity >= 50) return 0.15;
    if (quantity >= 20) return 0.10;
    if (quantity >= 10) return 0.05;
    return 0;
  };

  const calculateItemTotal = (item: { sizeQuantities: Record<string, number>; title: string }) => {
    const totalQuantity = Object.values(item.sizeQuantities).reduce((sum: number, qty: number) => sum + qty, 0);
    if (totalQuantity === 0) return 0;

    const basePrice = 500; // Base price for t-shirts
    const stylePremium = getStylePremium(item.title);
    const pricePerItem = basePrice + stylePremium;
    const subtotal = pricePerItem * totalQuantity;
    const discount = getBulkDiscount(totalQuantity);
    const discountAmount = subtotal * discount;

    return subtotal - discountAmount;
  };

  const handleQuantityChange = async (itemId: string, size: string, quantity: number) => {
    const updatedCartItems = cartItems.map(item => {
      if (item._id === itemId) {
        const updatedItem = {
          ...item,
          sizeQuantities: {
            ...item.sizeQuantities,
            [size]: quantity
          }
        };
        // Recalculate the price for this item
        updatedItem.price = calculateItemTotal(updatedItem);
        return updatedItem;
      }
      return item;
    });

    setCartItems(updatedCartItems);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const handleCheckout = async () => {
    if (calculateTotal() === 0) {
      toast.error('Cannot checkout with 0 order');
      return;
    }
    setShowShippingForm(true);
  };

  const handleShippingSubmit = async (address: any) => {
    console.log('Shipping address:', address);
    try {
      let shippingAddressData;
      
      
      if (address.isNewAddress) {
        const { isNewAddress, ...addressToSave } = address;
        shippingAddressData = await shippingService.addAddress({...addressToSave, userId: user?._id});
      } else {
        shippingAddressData = address;
      }
      
      setShippingAddress(shippingAddressData);
      
      const paymentResponse = await axios.post('/api/create-payment-intent', {
        amount: calculateTotal(),
      });
      if (!paymentResponse.data.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      setClientSecret(paymentResponse.data.clientSecret);
      setShowShippingForm(false);
      setShowPayment(true);
    } catch (error) {
      console.error('Error processing shipping:', error);
      toast.error('Error processing shipping. Please try again.');
      setShowPayment(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      await orderService.createOrder({
        userId: user?._id ?? '',
        items: cartItems,
        shippingAddress,
        paymentStatus: 'completed',
        status: 'Processing',
        totalAmount: calculateTotal(),
      });


      await cartService.removeByUserId(user?._id ?? '');
      setCartItems([]);
      setShowPayment(false);
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Error finalizing order:', error);
      toast.error('Payment successful but error creating order. Please contact support.');
    }
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      const response = await api.get(`/files/${fileId}`, {
        responseType: 'blob',
      });
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileId);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        console.error('File not found');
        toast.error('File not found');
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        console.error('File not found');
        toast.error('File not found');
      } else {
        console.error('Error downloading file:', error);
        toast.error('Error downloading file');
      }
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {cartItems.map(item => (
              <div key={item._id} className="p-6 bg-white rounded-lg shadow-lg flex justify-between items-center">
                <div>
                  <div className='flex'>
                    <h2 className="text-xl font-semibold mb-2">{item.title}:</h2>
                    <p className="text-gray-700 ml-3 mt-1 font-semibold">৳{item.price.toFixed(2)}</p>
                  </div>

                  <div className="text-gray-700">
                    <div className="flex space-x-4">
                      {Object.entries(item.sizeQuantities as Record<string, number>).map(([size, quantity]) => (
                        <div key={size} className="flex items-center space-x-2 border p-2 rounded-lg">
                          <label className="font-medium">{size}:</label>
                          <button
                            onClick={() => handleQuantityChange(item._id, size, Math.max(0, quantity - 1))}
                            className="px-3 py-1 bg-gray-200 rounded-xl hover:bg-gray-300"
                          >
                            -
                          </button>
                          <div>{quantity}</div>
                          <button
                            onClick={() => handleQuantityChange(item._id, size, quantity + 1)}
                            className="px-3 py-1 bg-gray-200 rounded-xl hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => handleDownloadFile(item.fileId)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    <FaDownload />
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">

                <div className="flex justify-between items-center">
                  <div className="text-xl font-semibold">
                    Total: ${calculateTotal()}
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                  >
                    Proceed to Payment
                  </button>
                </div>
                {showShippingForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                      <ShippingAddressForm
                        onSubmit={handleShippingSubmit}
                        onCancel={() => setShowShippingForm(false)}
                      />
                    </div>
                  </div>
                )}
                {showPayment && clientSecret && stripePromise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                        setShowPayment={setShowPayment}
                      />
                    </Elements>
                  </div>
                </div>
              )}
              {showPayment && !stripePromise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Error</h2>
                    <p className="text-red-500 mb-4">
                      Payment system is not properly configured. Please contact support.
                    </p>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
