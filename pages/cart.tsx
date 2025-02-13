import { useEffect, useState } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { useAuth } from '@/context/AuthContext';
import { FaTrash, FaDownload } from 'react-icons/fa';

const Cart = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;

      try {
        const response = await axios.get('/api/cart', {
          params: { userId: user.id }
        });
        setCartItems(response.data);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [user]);

  const handleRemoveItem = async (id: string) => {
    try {
      await axios.delete('/api/cart', { params: {userId: user?.id}, data: { id, userId: user?.id } });
      setCartItems(cartItems.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleQuantityChange = (itemId: string, size: string, quantity: number) => {
    setCartItems(cartItems.map(item => {
      if (item._id === itemId) {
        return {
          ...item,
          sizeQuantities: {
            ...item.sizeQuantities,
            [size]: quantity
          }
        };
      }
      return item;
    }));
  };

  const handleDownloadFile = async (fileId: string) => {
    try {
      const response = await axios.get(`/api/files/${fileId}`, {
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
        alert('File not found');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
        console.error('File not found');
        alert('File not found');
      } else {
        console.error('Error downloading file:', error);
        alert('Error downloading file');
      }
    }
  };

  const handleCheckout = async () => {
    try {
      const response = await axios.post('/api/checkout', {
        userId: user?.id,
        items: cartItems
      });
      if (response.status === 200) {
        alert('Order placed successfully!');
          await axios.delete('/api/cart', { params: { userId: user?.id }, data: { userId: user?.id } });
        setCartItems([]);
      } else {
        console.error('Error placing order');
        alert('Error placing order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
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
                    <p className="text-gray-700 ml-3 mt-1 font-semibold">{item.price}</p>
                  </div>

                  <div className="text-gray-700">
                    <div className="flex space-x-4">
                      {Object.entries(item.sizeQuantities).map(([size, quantity]) => (
                        <div key={size} className="flex items-center space-x-2 border p-2 rounded-lg">
                          <label className="font-medium">{size}:</label>
                          <button
                            onClick={() => handleQuantityChange(item._id, size, Math.max(0, quantity - 1))}
                            className="px-3 py-1 bg-gray-200 rounded-xl hover:bg-gray-300"
                          >
                            -
                          </button>
                          <div>{quantity as number}</div>
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
            <div className="flex justify-end mt-6">
              <button
                onClick={handleCheckout}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
