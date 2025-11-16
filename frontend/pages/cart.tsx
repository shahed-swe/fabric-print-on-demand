import { useEffect, useState } from 'react';
import api from '../config/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { FaTrash, FaDownload, FaEdit } from 'react-icons/fa';
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
  const [editingSizes, setEditingSizes] = useState<string | null>(null);
  const [tempSizeQuantities, setTempSizeQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
  const fetchCartItems = async () => {
    if (!user?._id) return; 
    try {
      const response = await cartService.getCartItems(user._id);
      const items = response.items || [];
      
      // Fix pricing for custom designs: should be $30 per item
      const fixedItems = items.map((item: any) => {
        if (item.itemType === 'design' && item.quantity) {
          const correctPrice = 30 * item.quantity;
          // If price is different, we'll update it on the backend when user edits
          return { ...item, price: correctPrice };
        }
        return item;
      });
      
      setCartItems(fixedItems);
    } catch (error: any) {
      console.error('Error fetching cart items:', error);
      toast.error(error.message || 'Failed to load cart items');
    }
  };

  fetchCartItems();
}, [user]);

  const handleRemoveItem = async (itemId: string) => {
    if (!user?._id) return;
    try {
      await cartService.removeFromCart(itemId, user._id);
      setCartItems(cartItems.filter(item => item._id !== itemId));
      toast.success('Item removed successfully');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Error removing item');
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!user?._id || newQuantity < 1) return;
    
    try {
      await cartService.updateCartItem(itemId, newQuantity, user._id);
      const updatedCartItems = cartItems.map(item => {
        if (item._id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      setCartItems(updatedCartItems);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error updating quantity');
    }
  };

  const handleEditSizes = (item: any) => {
    if (item.itemType === 'design' && item.designId?.sizeQuantities) {
      const sizeQty: Record<string, number> = {};
      Object.entries(item.designId.sizeQuantities).forEach(([size, qty]: [string, any]) => {
        sizeQty[size] = Number(qty) || 0;
      });
      setTempSizeQuantities(sizeQty);
      setEditingSizes(item._id);
    }
  };

  const handleSizeQuantityChange = (size: string, newQty: number) => {
    setTempSizeQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, newQty)
    }));
  };

  const handleSaveSizes = async (itemId: string) => {
    if (!user?._id) return;
    
    try {
      const totalQty = Object.values(tempSizeQuantities).reduce((sum, qty) => sum + qty, 0);
      
      if (totalQty < 1) {
        toast.error('Total quantity must be at least 1');
        return;
      }

      const response = await cartService.updateDesignSizes(itemId, tempSizeQuantities, user._id);
      
      // Update cart items with the response
      if (response.cart?.items) {
        const items = response.cart.items;
        
        // Ensure pricing is correct for custom designs
        const fixedItems = items.map((item: any) => {
          if (item.itemType === 'design' && item.quantity) {
            const correctPrice = 30 * item.quantity;
            return { ...item, price: correctPrice };
          }
          return item;
        });
        
        setCartItems(fixedItems);
      }
      
      setEditingSizes(null);
      toast.success('Sizes updated successfully');
    } catch (error) {
      console.error('Error updating sizes:', error);
      toast.error('Error updating sizes');
    }
  };

  const handleCancelEditSizes = () => {
    setEditingSizes(null);
    setTempSizeQuantities({});
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // For products: price is per unit, multiply by quantity
      // For designs: price is already total for all items
      if (item.itemType === 'product') {
        return total + (item.price * item.quantity);
      } else {
        return total + item.price;
      }
    }, 0);
  };

  const SHIPPING_COST = 7;

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 0 ? subtotal + SHIPPING_COST : 0;
  };

  const handleCheckout = async () => {
    if (calculateSubtotal() === 0) {
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
      // Transform cart items to proper format for order
      const orderItems = cartItems.map(item => {
        const orderItem: any = {
          itemType: item.itemType,
          quantity: item.quantity,
          price: item.price
        };
        
        // Only add designId if it's a design
        if (item.itemType === 'design' && item.designId?._id) {
          orderItem.designId = item.designId._id;
        }
        
        // Only add productId and product details if it's a product
        if (item.itemType === 'product' && item.productId?._id) {
          orderItem.productId = item.productId._id;
          if (item.size) orderItem.size = item.size;
          if (item.color) orderItem.color = item.color;
        }
        
        return orderItem;
      });

      console.log('Sending order items:', orderItems);

      await orderService.createOrder({
        userId: user?._id ?? '',
        items: orderItems,
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
              <div key={item._id} className="p-6 bg-white rounded-lg shadow-lg">
                <div className="flex gap-6 items-start">
                  {/* Product Image */}
                  {item.itemType === 'product' && item.productId && (
                    <div className="flex-shrink-0">
                      <img
                        src={
                          item.productId.images?.find((img: any) => img.isPrimary)?.url ||
                          item.productId.images?.[0]?.url ||
                          'https://via.placeholder.com/150'
                        }
                        alt={item.productId.name}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Design Preview */}
                  {item.itemType === 'design' && (
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-center">
                        <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="flex-1">
                    {/* Item Type Badge */}
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ${
                      item.itemType === 'design' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.itemType === 'design' ? 'Custom Design' : 'Product'}
                    </span>

                    {/* Item Title */}
                    <h2 className="text-xl font-semibold mb-2">
                      {item.itemType === 'product' 
                        ? item.productId?.name || 'Product'
                        : item.designId?.title || 'Custom Design'}
                    </h2>

                    {/* Product Details */}
                    {item.itemType === 'product' && (
                      <div className="text-gray-700 mb-3 space-y-1">
                        {item.size && <p className="text-sm">Size: <span className="font-medium">{item.size}</span></p>}
                        {item.color && <p className="text-sm">Color: <span className="font-medium">{item.color}</span></p>}
                        {item.productId?.material && (
                          <p className="text-sm text-gray-600">{item.productId.material}</p>
                        )}
                      </div>
                    )}

                    {/* Design Details */}
                    {item.itemType === 'design' && item.designId && (
                      <div className="text-gray-700 mb-3">
                        <p className="text-sm text-gray-600">Custom print-on-demand design</p>
                        {item.designId.sizeQuantities && editingSizes !== item._id && (
                          <div className="mt-2 text-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">Sizes: </span>
                                {Object.entries(item.designId.sizeQuantities).map(([size, qty]: [string, any]) => (
                                  qty > 0 && <span key={size} className="mr-2">{size}: {qty}</span>
                                ))}
                              </div>
                              <button
                                onClick={() => handleEditSizes(item)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center space-x-1 text-xs"
                              >
                                <FaEdit />
                                <span>Edit Sizes</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Size Editor */}
                        {editingSizes === item._id && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-semibold mb-3">Edit Size Quantities</h4>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <div key={size} className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{size}:</span>
                                  <div className="flex items-center space-x-2 border rounded">
                                    <button
                                      onClick={() => handleSizeQuantityChange(size, (tempSizeQuantities[size] || 0) - 1)}
                                      className="px-2 py-1 hover:bg-gray-200"
                                    >
                                      -
                                    </button>
                                    <span className="px-3 text-sm">{tempSizeQuantities[size] || 0}</span>
                                    <button
                                      onClick={() => handleSizeQuantityChange(size, (tempSizeQuantities[size] || 0) + 1)}
                                      className="px-2 py-1 hover:bg-gray-200"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              Total: {Object.values(tempSizeQuantities).reduce((sum, qty) => sum + qty, 0)} items
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSaveSizes(item._id)}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEditSizes}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quantity Controls - Only show for products, not custom designs */}
                    {item.itemType === 'product' && (
                      <div className="flex items-center space-x-4 mt-3">
                        <span className="text-sm font-medium text-gray-700">Quantity:</span>
                        <div className="flex items-center space-x-2 border rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 rounded-l-lg"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-3">
                      {item.itemType === 'product' ? (
                        <>
                          <span className="text-sm text-gray-600">Unit Price: </span>
                          <span className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                          {item.quantity > 1 && (
                            <span className="text-sm text-gray-600 ml-2">
                              (Total: ${(item.price * item.quantity).toFixed(2)})
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-gray-600">Total Price: </span>
                          <span className="text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ($30.00 per item × {item.quantity})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center space-x-2"
                    >
                      <FaTrash />
                      <span className="text-sm">Remove</span>
                    </button>
                    {item.itemType === 'design' && item.designId?.fileId && (
                      <button
                        onClick={() => handleDownloadFile(item.designId.fileId)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center space-x-2"
                      >
                        <FaDownload />
                        <span className="text-sm">Download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {calculateSubtotal() > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span>${SHIPPING_COST.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <div className="text-xl font-semibold">
                        Total: ${calculateTotal().toFixed(2)}
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
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
