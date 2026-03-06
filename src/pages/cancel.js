// Create a cancel page to handle canceled payments
export default function Cancel() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-100 text-red-800">
      <h1 className="text-4xl font-bold">Payment Canceled</h1>
      <p className="mt-4 text-lg">Your payment was not completed. You can try again or contact support if you need assistance.</p>
      <a href="/" className="mt-4 rounded bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
        Go Back to Home
      </a>
    </div>
  );
}