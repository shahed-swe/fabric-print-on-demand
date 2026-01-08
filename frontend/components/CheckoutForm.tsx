import React, { useState } from 'react';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  setShowPayment: React.Dispatch<React.SetStateAction<boolean>>;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onSuccess, setShowPayment }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424242',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const cardNumberElement = elements.getElement(CardNumberElement);

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumberElement!,
      },
    });

    if (paymentError) {
      setError(paymentError.message || 'An error occurred');
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess();
    }
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
        <CardNumberElement options={elementOptions} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
          <CardExpiryElement options={elementOptions} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Security Code</label>
          <CardCvcElement options={elementOptions} />
        </div>
      </div>

      {error && <div className="text-red-500 mb-3 text-sm">{error}</div>}
      <div className='grid grid-cols-2 gap-4'>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 disabled:bg-gray-400"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        <button
          onClick={() => setShowPayment(false)}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
