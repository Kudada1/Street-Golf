import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Use environment variable for the secret key

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log(req.body);

      const { items } = req.body;

      console.log('Items received:', items);
      // Validate items to ensure only one of `name` or `price` is specified
      if (items.some(item => item.name && item.price)) {
        console.log('Validation failed for items:', items.filter(item => item.name && item.price));
        return res.status(400).json({ error: 'You may only specify one of these parameters: name, price.' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item) => {
          if (item.price) {
            return {
              price: item.price, // Ensure `price` is the ID of a Stripe price object
              quantity: item.quantity,
            };
          } else if (item.price_data) {
            return {
              price_data: item.price_data, // Provide price_data object if `price` is not available
              quantity: item.quantity,
            };
          } else {
            throw new Error('Each item must have either a `price` or `price_data`.');
          }
        }),
        mode: 'payment',
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}