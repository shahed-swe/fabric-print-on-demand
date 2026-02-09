import React, { useState } from 'react';
import ManualPaymentForm from './ManualPaymentForm';

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: () => void;
  setShowPayment: React.Dispatch<React.SetStateAction<boolean>>;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onSuccess, setShowPayment }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>
      <ManualPaymentForm 
        clientSecret={clientSecret} 
        onSuccess={onSuccess} 
        setShowPayment={setShowPayment}
      />
    </div>
  );
};

export default CheckoutForm;
