import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { shippingService } from '@/services/shipping';

interface Address {
  _id: string;
  fullName: string;
  address: string;  // changed from streetAddress
  city: string;
  state: string;
  zipCode: string;  // changed from postalCode
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
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',  // changed from streetAddress
    city: '',
    state: '',
    zipCode: '',  // changed from postalCode
    phone: ''
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (!user?._id) return;
        const addresses = await shippingService.getAddresses(user._id);
        console.log(addresses);
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
    if (selectedAddress === 'new') {
      try {
        const response = await shippingService.addAddress(formData);
        onSubmit({ ...formData, isNewAddress: true });
      } catch (error) {
        console.error('Error adding address:', error);
      }
    } else {
      const selected = savedAddresses.find(addr => addr._id === selectedAddress);
      if (selected) {
        const { _id, ...addressData } = selected;
        onSubmit({ ...addressData, isNewAddress: false });
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Shipping Address</h2>
      
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <label className="block mb-2">Select Address:</label>
          <select 
            className="w-full p-2 border rounded"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
          >
            <option value="new">Add New Address</option>
            {savedAddresses.map(addr => (
              <option key={addr._id} value={addr._id}>
                {addr.fullName} - {addr.address}, {addr.city}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedAddress === 'new' && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              className="w-full p-2 border rounded"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              required
              className="w-full p-2 border rounded"
              value={formData.address}
              onChange={handleInputChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                required
                className="w-full p-2 border rounded"
                value={formData.city}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                required
                className="w-full p-2 border rounded"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              name="zipCode"
              placeholder="Zip Code"
              required
              className="w-full p-2 border rounded"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              required
              className="w-full p-2 border rounded"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>
        </form>
      )}

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default ShippingAddressForm;
