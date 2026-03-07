
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51T73p5Hb6kCFS53zv93sm9GDcMxIAJJoXIHAYGRf7E0dMIjD5bmYz8cnMuIW47PSKh0EU7daFe4w16nJe1NnOMR800UmTABCkr'; // ← CAMBIAR

// Cargar Stripe
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);