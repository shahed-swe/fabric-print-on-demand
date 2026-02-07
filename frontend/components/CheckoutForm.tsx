import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation`,
      },
      redirect: 'if_required',
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
      <PaymentElement options={{
        layout: 'tabs',
        wallets: { applePay: 'auto', googlePay: 'auto' },
        fields: {
          billingDetails: 'auto'
        }
      }} />
      {error && <div className="text-red-500 mt-2">{error}</div>}
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
