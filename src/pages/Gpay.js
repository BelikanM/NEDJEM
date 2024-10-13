import React from 'react';

const GPay = () => {
  const handlePayment = () => {
    // Logic to initiate GPay payment
    alert('Payment process started with Google Pay!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Google Pay</h2>
        <p className="mb-4">To download this content, please complete the payment process.</p>
        <button
          onClick={handlePayment}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Pay with Google Pay
        </button>
        <button
          onClick={() => window.location.reload()} // Refresh page or handle close differently
          className="mt-4 text-red-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
