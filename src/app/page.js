"use client";

import { useState } from 'react';

async function handleCheckout(cart) {
  const formattedCart = cart.map((item) => ({
    price_data: {
      currency: 'cad', 
      product_data: {
        name: item.name,
      },
      unit_amount: item.price * 100, // Convert price to cents
    },
    quantity: item.quantity,
  }));

  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: formattedCart }),
  });

  const data = await response.json();

  if (response.ok) {
    window.location.href = data.url; // Redirect to Stripe checkout
  } else {
    alert(data.error);
  }
}

export default function Home() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const products = [
    { id: 1, name: 'Black Beanie', price: 35, image: '/images/beanie-black.jpg' },
    { id: 2, name: 'Purple Beanie', price: 35, image: '/images/beanie-purple.jpg' },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center bg-black text-white">
      {/* Hero Section */}
      <header className="w-full py-16 text-center">
        <h1 className="text-4xl font-bold tracking-wide">Street Golf</h1>
        <p className="mt-4 text-lg">Blending Urban Street Culture with Golf Fashion</p>
      </header>

      {/* Product Grid */}
      <main className="grid w-full max-w-5xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="group relative overflow-hidden rounded-lg bg-charcoal">
            <img
              src={product.image}
              alt={product.name}
              className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black to-transparent p-4">
              <h2 className="text-xl font-semibold">{product.name}</h2>
              <p className="mt-2 text-lg">${product.price}</p>
              <button
                onClick={() => addToCart(product)}
                className="mt-4 rounded bg-purple px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Slide-Out Cart */}
      {isCartOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 p-4 shadow-lg">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            Close
          </button>
          <div className="mt-4 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-400">${item.price} x {item.quantity}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="rounded bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-600"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="rounded bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="rounded bg-red-700 px-2 py-1 text-sm text-white hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="text-lg font-bold">
              Total: ${cart.reduce((total, item) => total + item.price * item.quantity, 0)}
            </h3>
            <button
              onClick={() => handleCheckout(cart)}
              className="mt-4 w-full rounded bg-purple px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
            >
              Checkout
            </button>
          </div>
        </div>
      )}

      {/* Purple Beanie Story Section */}
      <section className="w-full bg-purple py-16 text-center text-white">
        <h2 className="text-3xl font-bold">The Meaning of Purple</h2>
        <p className="mt-4 max-w-3xl mx-auto text-lg">
          The purple beanie represents awareness and solidarity against gender-based violence in South Africa. By wearing this beanie, you join a movement to create a safer and more equitable world.
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-sm text-gray-400">
        © 2026 Street Golf. All rights reserved.
      </footer>
    </div>
  );
}
