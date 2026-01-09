import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export const PRICES = {
  single: {
    amount: 300, // $3.00
    name: 'Single Class',
    description: 'One syllabus → complete study system',
  },
  semester: {
    amount: 800, // $8.00
    name: 'Semester Pack',
    description: 'Up to 6 syllabi → complete study systems',
  },
};
