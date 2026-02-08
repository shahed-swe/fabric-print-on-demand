import { useEffect, useState } from 'react';
import api from '../config/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { FaTrash, FaDownload, FaEdit } from 'react-icons/fa';
import CheckoutForm from '../components/CheckoutForm';
import { toast } from 'react-toastify';
import ShippingAddressForm from '../components/ShippingAddressForm';
import { cartService } from '../services/cart';
import { orderService } from '../services/order';
import { shippingService } from '../services/shipping';
import { guestAuthService } from '../services/guestAuth';
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
  const { refreshCart } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [editingSizes, setEditingSizes] = useState<string | null>(null);
  const [tempSizeQuantities, setTempSizeQuantities] = useState<Record<string, number>>({});
  const [guestAccountUserId, setGuestAccountUserId] = useState<string | null>(null);

  useEffect(() => {
  const fetchCartItems = async () => {
    if (!user?._id) return; 
    try {
      const response = await cartService.getCartItems(user._id);
      const items = response.items || [];
      
      setCartItems(items);
      refreshCart(); // Update cart count in navbar
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
      refreshCart(); // Update cart count in navbar
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
      
      // Update cart items with the response from backend
      if (response.cart?.items) {
        setCartItems(response.cart.items);
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
      let userId = user?._id;
      let shippingAddressData;
      
      // Check if this is a guest user
      const isGuest = !user || user._id?.startsWith('guest_');
      if (isGuest && address.guestEmail) {
        try {
          // Create a guest account with the provided email
          const guestResponse = await guestAuthService.createGuestAccount(address.guestEmail);
          userId = guestResponse.userId;
          setGuestAccountUserId(guestResponse.userId); // Store the new user ID for order creation
          toast.success('Account created! Check your email for login credentials.');
        } catch (error: any) {
          console.error('Error creating guest account:', error);
          toast.error(error.response?.data?.message || 'Error creating account. Please try again.');
          return;
        }
      }
      
      if (address.isNewAddress) {
        const { isNewAddress, guestEmail, ...addressToSave } = address;
        shippingAddressData = await shippingService.addAddress({...addressToSave, userId});
      } else {
        const { guestEmail, ...cleanAddress } = address;
        shippingAddressData = cleanAddress;
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
          // For products: store total price (unit price × quantity)
          // For designs: price is already total
          price: item.itemType === 'product' ? item.price * item.quantity : item.price
        };
        
        // Only add designId if it's a design
        if (item.itemType === 'design' && item.designId) {
          // Handle both populated (object) and unpopulated (string) designId
          orderItem.designId = typeof item.designId === 'object' ? item.designId._id : item.designId;
        }
        
        // Only add productId and product details if it's a product
        if (item.itemType === 'product' && item.productId) {
          // Handle both populated (object) and unpopulated (string) productId
          orderItem.productId = typeof item.productId === 'object' ? item.productId._id : item.productId;
          if (item.size) orderItem.size = item.size;
          if (item.color) orderItem.color = item.color;
        }
        
        return orderItem;
      });

      console.log('Order items being sent:', orderItems); // Debug log

      // Use guestAccountUserId if it exists (for new guest accounts), otherwise use user._id
      const finalUserId = (guestAccountUserId || user?._id) ?? '';

      await orderService.createOrder({
        userId: finalUserId,
        items: orderItems,
        shippingAddress,
        paymentStatus: 'completed',
        status: 'Processing',
        totalAmount: calculateTotal(),
      });


      await cartService.removeByUserId(finalUserId);
      setCartItems([]);
      refreshCart(); // Reset cart count to 0
      setShowPayment(false);
      setGuestAccountUserId(null); // Clear the guest account userId
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
      <div className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">Shopping Cart</h1>
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {cartItems.map(item => (
              <div key={item._id} className="p-4 md:p-6 bg-white rounded-lg shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-start">
                  {/* Product Image */}
                  {item.itemType === 'product' && item.productId && (
                    <div className="flex-shrink-0 w-full md:w-auto">
                      <img
                        src={
                          item.productId.images?.find((img: any) => img.isPrimary)?.url ||
                          item.productId.images?.[0]?.url ||
                          'https://via.placeholder.com/150'
                        }
                        alt={item.productId.name}
                        className="w-full md:w-32 h-40 md:h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Design Preview */}
                  {item.itemType === 'design' && (
                    <div className="flex-shrink-0 w-full md:w-auto">
                      {item.designId?.frontImageFileId ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL || 'https://backend.customprintingservices.com.au/api'}/files/${item.designId.frontImageFileId}`}
                          alt="Design front view"
                          className="w-full md:w-32 h-40 md:h-32 object-cover rounded-lg border border-purple-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                          }}
                        />
                      ) : (
                        <div className="w-full md:w-32 h-40 md:h-32 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-center">
                          <svg className="w-12 h-12 md:w-16 md:h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex-1 w-full">
                    {/* Item Type Badge */}
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ${
                      item.itemType === 'design' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.itemType === 'design' ? 'Custom Design' : 'Product'}
                    </span>

                    {/* Item Title */}
                    <h2 className="text-lg md:text-xl font-semibold mb-2">
                      {item.itemType === 'product' 
                        ? item.productId?.name || 'Product'
                        : item.designId?.title || 'Custom Design'}
                    </h2>

                    {/* Product Details */}
                    {item.itemType === 'product' && (
                      <div className="text-gray-700 mb-3 space-y-1">
                        {item.size && <p className="text-xs md:text-sm">Size: <span className="font-medium">{item.size}</span></p>}
                        {item.color && <p className="text-xs md:text-sm">Color: <span className="font-medium">{item.color}</span></p>}
                        {item.productId?.material && (
                          <p className="text-xs md:text-sm text-gray-600">{item.productId.material}</p>
                        )}
                      </div>
                    )}

                    {/* Design Details */}
                    {item.itemType === 'design' && item.designId && (
                      <div className="text-gray-700 mb-3">
                        <p className="text-xs md:text-sm text-gray-600">Custom print-on-demand design</p>
                        {item.designId.sizeQuantities && editingSizes !== item._id && (
                          <div className="mt-2 text-xs md:text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div>
                                <span className="font-medium">Sizes: </span>
                                <div className="flex flex-wrap gap-1 mt-1 sm:mt-0 sm:inline-flex">
                                  {Object.entries(item.designId.sizeQuantities).map(([size, qty]: [string, any]) => (
                                    qty > 0 && <span key={size} className="text-xs sm:text-sm">{size}: {qty}</span>
                                  ))}
                                </div>
                              </div>
                              <button
                                onClick={() => handleEditSizes(item)}
                                className="w-full sm:w-auto px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center sm:justify-start space-x-1 text-xs"
                              >
                                <FaEdit />
                                <span>Edit Sizes</span>
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Size Editor */}
                        {editingSizes === item._id && (
                          <div className="mt-3 p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-200">
                            <h4 className="text-sm font-bold text-gray-800 mb-4">Size Quantities</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
                              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                <div key={size} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-2 sm:px-3 py-2 bg-white rounded-lg border border-orange-300 hover:border-orange-500 transition-all">
                                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1 sm:mb-0">{size}</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="999"
                                    value={tempSizeQuantities[size] || 0}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value) || 0;
                                      if (value >= 0) {
                                        handleSizeQuantityChange(size, value);
                                      }
                                    }}
                                    className="w-full sm:w-24 px-2 sm:px-3 py-1 text-center text-sm font-bold text-orange-600 bg-white border-2 border-orange-300 rounded-lg hover:border-orange-500 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-all"
                                  />
                                </div>
                              ))}
                            </div>
                            <div className="bg-white rounded-lg border border-orange-300 p-3 mb-4 text-center">
                              <span className="text-xs sm:text-sm text-gray-600">Total Items: </span>
                              <span className="text-lg sm:text-xl font-bold text-orange-600">{Object.values(tempSizeQuantities).reduce((sum, qty) => sum + qty, 0)}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={() => handleSaveSizes(item._id)}
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition duration-200 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg"
                              >
                                ✓ Save
                              </button>
                              <button
                                onClick={handleCancelEditSizes}
                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200 text-xs sm:text-sm font-bold"
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
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs md:text-sm font-medium text-gray-700">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            if (value >= 1) {
                              handleQuantityChange(item._id, value);
                            }
                          }}
                          className="w-16 md:w-20 px-2 md:px-3 py-2 text-center text-lg font-semibold text-gray-800 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                        />
                      </div>
                    )}

                    {/* Price */}
                    <div className="mt-3">
                      {item.itemType === 'product' ? (
                        <>
                          <span className="text-xs md:text-sm text-gray-600">Unit Price: </span>
                          <span className="text-base md:text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                          {item.quantity > 1 && (
                            <span className="text-xs md:text-sm text-gray-600 ml-2">
                              (Total: ${(item.price * item.quantity).toFixed(2)})
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-xs md:text-sm text-gray-600">Total Price: </span>
                          <span className="text-base md:text-lg font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                          <span className="text-xs md:text-sm text-gray-600 ml-2">
                            ($30.00 per item × {item.quantity})
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 w-full md:w-auto md:ml-4">
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 flex items-center justify-center md:justify-start space-x-2 text-xs md:text-sm"
                    >
                      <FaTrash />
                      <span>Remove</span>
                    </button>
                    {item.itemType === 'design' && item.designId?.fileId && (
                      <button
                        onClick={() => handleDownloadFile(item.designId.fileId)}
                        className="px-3 md:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center md:justify-start space-x-2 text-xs md:text-sm"
                      >
                        <FaDownload />
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 md:p-6 bg-white rounded-lg shadow-lg">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 text-sm md:text-base">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {calculateSubtotal() > 0 && (
                    <div className="flex justify-between text-gray-600 text-sm md:text-base">
                      <span>Shipping:</span>
                      <span>${SHIPPING_COST.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="text-lg md:text-xl font-semibold">
                        Total: ${calculateTotal().toFixed(2)}
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 text-sm md:text-base"
                      >
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </div>
                {showShippingForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
                      <ShippingAddressForm
                        onSubmit={handleShippingSubmit}
                        onCancel={() => setShowShippingForm(false)}
                      />
                    </div>
                  </div>
                )}
                {showPayment && clientSecret && stripePromise && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md max-h-screen overflow-y-auto">
                    <h2 className="text-xl md:text-2xl font-bold mb-4">Complete Your Payment</h2>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                  <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 text-red-600">Payment Error</h2>
                    <p className="text-xs md:text-sm text-red-500 mb-4">
                      Payment system is not properly configured. Please contact support.
                    </p>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm md:text-base"
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
