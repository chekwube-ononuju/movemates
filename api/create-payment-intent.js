import Stripe from 'stripe';

/**
 * Serverless function to create a PaymentIntent with a 10% service fee.
 *
 * This endpoint expects a JSON body with an `amount` field representing the
 * amount in US dollars that the user wishes to pay (excluding service fee).
 * It responds with the PaymentIntent `clientSecret` and the total amount
 * (including the 10% fee) charged in cents.
 *
 * Note: The Stripe secret key must be provided via the `STRIPE_SECRET_KEY`
 * environment variable. Define this in your Vercel project settings or
 * `.env` file. Never commit the secret key to version control.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    res.status(400).json({ error: 'Invalid JSON' });
    return;
  }
  const { amount } = body || {};
  if (!amount || isNaN(parseFloat(amount))) {
    res.status(400).json({ error: 'Missing or invalid amount' });
    return;
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    res.status(500).json({ error: 'Stripe secret key not configured' });
    return;
  }
  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2024-08-16',
  });

  // Convert amount to number and calculate total with 10% fee
  const amountFloat = parseFloat(amount);
  const totalAmount = Math.round(amountFloat * 1.10 * 100); // convert to cents

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.status(200).json({ clientSecret: paymentIntent.client_secret, totalAmount });
  } catch (error) {
    console.error('Stripe error', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}