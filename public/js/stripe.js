import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(
  'pk_test_51QmnRYKjlTguqniSA0ZlNazo842LWXWJliy5Ufp2JCaGsODy1AvTx9kHwgb8Cb8Z6ZPwC0i0UZmH9bXwpFFB5Gkp00q2AXBbMT'
);

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    const stripe = await stripePromise;

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
  }
};
