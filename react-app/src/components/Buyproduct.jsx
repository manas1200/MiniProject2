import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('YOUR_STRIPE_PUBLISHABLE_KEY'); // Replace with your Stripe publishable key

const BuySection = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('usd');
    const stripe = useStripe();
    const elements = useElements();

    const handlePayment = async (e) => {
        e.preventDefault();

        const response = await fetch('/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, currency })
        });

        const { clientSecret } = await response.json();

        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: { name: 'Customer' }
            }
        });

        if (paymentResult.error) {
            console.error('Payment failed:', paymentResult.error.message);
        } else {
            console.log('Payment successful!');
        }
    };

    return (
        <form onSubmit={handlePayment}>
            <h2>Buy Product</h2>
            <label>Amount:</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <label>Currency:</label>
            <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} />
            <CardElement />
            <button type="submit" disabled={!stripe}>Pay</button>
        </form>
    );
};

const BuySectionWrapper = () => (
    <Elements stripe={stripePromise}>
        <BuySection />
    </Elements>
);

export default BuySectionWrapper;
