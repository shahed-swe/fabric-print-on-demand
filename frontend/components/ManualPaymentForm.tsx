import React, { useState } from 'react';
import { useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';

interface ManualPaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  setShowPayment: React.Dispatch<React.SetStateAction<boolean>>;
}

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({ clientSecret, onSuccess, setShowPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Validation states for each field
  const [cardNumberError, setCardNumberError] = useState('');
  const [expiryError, setExpiryError] = useState('');
  const [cvcError, setCvcError] = useState('');
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);

  const elementStyles = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Handle card number validation
  const handleCardNumberChange = (event: any) => {
    setCardNumberError(event.error?.message || '');
    setCardNumberComplete(event.complete);
  };

  // Handle expiry validation
  const handleExpiryChange = (event: any) => {
    setExpiryError(event.error?.message || '');
    setExpiryComplete(event.complete);
  };

  // Handle CVC validation
  const handleCvcChange = (event: any) => {
    setCvcError(event.error?.message || '');
    setCvcComplete(event.complete);
  };

  const isFormValid = cardNumberComplete && expiryComplete && cvcComplete && !cardNumberError && !expiryError && !cvcError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe not loaded. Please refresh and try again.');
      return;
    }

    // Validate all fields are complete
    if (!isFormValid) {
      setError('Please fill in all card details correctly');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Get card element
      const cardNumberElement = elements.getElement(CardNumberElement);
      
      if (!cardNumberElement) {
        setError('Card element not found');
        setProcessing(false);
        return;
      }

      // Confirm payment with card
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'Payment failed');
      } else if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      } else {
        setError('Payment was not successful. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Number
        </label>
        <div className={`p-3 border rounded-lg focus-within:ring-2 focus-within:ring-orange-500 ${
          cardNumberError ? 'border-red-500' : 'border-gray-300'
        }`}>
          <CardNumberElement 
            options={elementStyles} 
            onChange={handleCardNumberChange}
          />
        </div>
        {cardNumberError && (
          <p className="text-sm text-red-600 mt-1">{cardNumberError}</p>
        )}
        {cardNumberComplete && !cardNumberError && (
          <p className="text-sm text-green-600 mt-1">✓ Valid card number</p>
        )}
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <div className={`p-3 border rounded-lg focus-within:ring-2 focus-within:ring-orange-500 ${
            expiryError ? 'border-red-500' : 'border-gray-300'
          }`}>
            <CardExpiryElement 
              options={elementStyles} 
              onChange={handleExpiryChange}
            />
          </div>
          {expiryError && (
            <p className="text-sm text-red-600 mt-1">{expiryError}</p>
          )}
          {expiryComplete && !expiryError && (
            <p className="text-sm text-green-600 mt-1">✓ Valid</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CVC
          </label>
          <div className={`p-3 border rounded-lg focus-within:ring-2 focus-within:ring-orange-500 ${
            cvcError ? 'border-red-500' : 'border-gray-300'
          }`}>
            <CardCvcElement 
              options={elementStyles} 
              onChange={handleCvcChange}
            />
          </div>
          {cvcError && (
            <p className="text-sm text-red-600 mt-1">{cvcError}</p>
          )}
          {cvcComplete && !cvcError && (
            <p className="text-sm text-green-600 mt-1">✓ Valid</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <button
          type="submit"
          disabled={!stripe || processing || !isFormValid}
          className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        <button
          type="button"
          onClick={() => setShowPayment(false)}
          disabled={processing}
          className="px-6 py-3 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition duration-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ManualPaymentForm;
