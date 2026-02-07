import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { shippingService } from '@/services/shipping';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';

interface Address {
  _id: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isNewAddress?: boolean;
}

interface ShippingAddressFormProps {
  onSubmit: (address: Omit<Address, '_id'>) => void;
  onCancel: () => void;
}

const ShippingAddressForm = ({ onSubmit, onCancel }: ShippingAddressFormProps) => {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('new');
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useAuth();
  const [guestEmail, setGuestEmail] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (!user?._id) return;
        const addresses = await shippingService.getAddresses(user._id);
        setSavedAddresses(addresses);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if guest needs to provide email
    const isGuest = !user || user._id?.startsWith('guest_');
    if (isGuest && !guestEmail) {
      toast.error('Please enter your email address to continue');
      return;
    }

    if (selectedAddress === 'new') {
      const submitData: any = { ...formData, isNewAddress: true };
      if (isGuest) {
        submitData.guestEmail = guestEmail;
      }
      onSubmit(submitData);
    } else {
      const selected = savedAddresses.find(addr => addr._id === selectedAddress);
      if (selected) {
        const { _id, ...addressData } = selected;
        const submitData: any = { ...addressData, isNewAddress: false };
        if (isGuest) {
          submitData.guestEmail = guestEmail;
        }
        onSubmit(submitData);
      }
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await shippingService.deleteAddress(addressId);
        setSavedAddresses(savedAddresses.filter(addr => addr._id !== addressId));
        if (selectedAddress === addressId) {
          setSelectedAddress('new');
          setIsAdding(true);
        }
        toast.success('Address deleted successfully');
      } catch (error) {
        console.error('Error deleting address:', error);
        toast.error('Failed to delete address');
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <FaMapMarkerAlt className="text-blue-600 text-2xl" />
        <h2 className="text-3xl font-bold text-gray-800">Shipping Address</h2>
      </div>

      {/* Saved Addresses Section */}
      {savedAddresses.length > 0 && !isAdding && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Addresses</h3>
          <div className="space-y-3">
            {savedAddresses.map(addr => (
              <div
                key={addr._id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedAddress === addr._id
                    ? 'border-blue-500 bg-white shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => setSelectedAddress(addr._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                        className="w-4 h-4"
                      />
                      <h4 className="font-semibold text-gray-900">{addr.fullName}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 ml-6">
                      {addr.address}
                    </p>
                    <p className="text-sm text-gray-600 ml-6">
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                    <p className="text-sm text-gray-600 ml-6">
                      📞 {addr.phone}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAddress(addr._id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete address"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setIsAdding(true);
              setFormData({
                fullName: '',
                address: '',
                city: '',
                state: '',
                zipCode: '',
                phone: ''
              });
            }}
            className="mt-4 w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <FaPlus /> Add New Address
          </button>
        </div>
      )}

      {/* Add/Edit Address Form */}
      {(isAdding || savedAddresses.length === 0) && (
        <form onSubmit={handleSubmit}>
          {/* Guest Email Section */}
          {(!user || user._id?.startsWith('guest_')) && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <p className="text-xs text-gray-600 mt-2">
                We'll create an account with this email and send you login credentials
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Street Address"
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={formData.address}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={formData.city}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              name="zipCode"
              placeholder="Zip Code"
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            {isAdding && savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow-md transition-all"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      )}

      {/* Submit for selected address */}
      {!isAdding && savedAddresses.length > 0 && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow-md transition-all"
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressForm;
