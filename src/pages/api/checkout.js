import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      console.log(req.body);

      const { items, currency = "cad", shippingDetails, discountCode } = req.body;

      console.log("Items received:", items);
      console.log("Currency received:", currency);
      console.log("Shipping details received:", shippingDetails);
      console.log("Discount code received:", discountCode);

      // Validate items to ensure they have required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ error: "Items array is required and must not be empty." });
      }

      // Validate currency
      const supportedCurrencies = ["cad", "usd", "eur"];
      if (!supportedCurrencies.includes(currency)) {
        return res.status(400).json({ error: "Unsupported currency." });
      }

      const origin = req.headers.origin || "http://localhost:3001";

      // Calculate dynamic shipping cost based on location
      let shippingAmount = 1000; // Default flat rate in cents
      if (shippingDetails && shippingDetails.location) {
        const location = shippingDetails.location.toLowerCase();
        if (location === "us") {
          shippingAmount = 1500; // $15 for US
        } else if (location === "eu") {
          shippingAmount = 2000; // $20 for EU
        } else {
          shippingAmount = 2500; // $25 for other locations
        }
      }

      // Validate discount code
      const validDiscountCodes = {
        SPRING10: 0.1, // 10% discount
        FREESHIP: 0, // Free shipping
      };

      let discountAmount = 0;
      if (discountCode && validDiscountCodes[discountCode]) {
        const discountRate = validDiscountCodes[discountCode];
        if (discountRate === 0) {
          shippingAmount = 0; // Free shipping
        } else {
          const totalItemAmount = items.reduce((sum, item) => {
            const unitAmount = item.price_data?.unit_amount || 0;
            return sum + unitAmount * (item.quantity || 1);
          }, 0);
          discountAmount = Math.round(totalItemAmount * discountRate);
        }
      }

      const shippingCost = {
        price_data: {
          currency,
          product_data: {
            name: "Shipping Fee",
          },
          unit_amount: shippingAmount,
        },
        quantity: 1,
      };

      const lineItems = [
        ...items.map((item) => {
          const { price, price_data, quantity, name, description } = item;

          // Validate that either price or price_data is provided
          if (!price && !price_data) {
            throw new Error(
              "Each item must have either a `price` (Stripe price ID) or `price_data` object.",
            );
          }

          // If price_data is provided, ensure it's properly structured
          if (price_data && !price_data.currency) {
            throw new Error("price_data must include a `currency` field.");
          }

          if (price) {
            return {
              price, // Stripe price ID
              quantity: quantity || 1,
            };
          } else {
            return {
              price_data: { ...price_data, currency }, // price_data object with currency and unit_amount
              quantity: quantity || 1,
            };
          }
        }),
        shippingCost, // Add shipping cost as a line item
      ];

      if (discountAmount > 0) {
        const discountLineItem = {
          price_data: {
            currency,
            product_data: {
              name: "Discount",
            },
            unit_amount: -discountAmount, // Negative amount for discount
          },
          quantity: 1,
        };
        lineItems.push(discountLineItem);
      }

      const orderTracking = {
        trackingNumber: `TRACK-${Date.now()}`,
        status: "Processing",
      };

      console.log("Order tracking initialized:", orderTracking);

      const wishlist = [];
      console.log("Wishlist feature placeholder initialized:", wishlist);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${origin}/success`,
        cancel_url: `${origin}/cancel`,
      });

      res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}