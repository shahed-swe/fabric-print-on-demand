import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

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

  const cardElementOptions = {
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
    hidePostalCode: true,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const cardElement = elements.getElement(CardElement);

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement!,
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
      <CardElement options={cardElementOptions} />
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      <div className='grid grid-cols-2 gap-4'>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 disabled:bg-gray-400"
        >
          {processing ? 'Processing...' : 'Pay Now'}
        </button>
        <button
          onClick={() => setShowPayment(false)}
          className="mt-4 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;
