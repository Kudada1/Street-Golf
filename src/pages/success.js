// Create a success page to handle successful payments
export default function Success() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-100 text-green-800">
      <h1 className="text-4xl font-bold">Payment Successful!</h1>
      <p className="mt-4 text-lg">Thank you for your purchase. Your order is being processed.</p>
      <a href="/" className="mt-4 rounded bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-700">
        Go Back to Home
      </a>
    </div>
  );
}