const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured in the environment variables');
}

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate the amount
    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({ message: 'Invalid amount' });
    }

    console.log('Creating payment intent with amount:', amount);

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card']
    });

    console.log('Payment intent created:', paymentIntent.id);

    // Respond with the client secret
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      message: 'Error creating payment intent',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
