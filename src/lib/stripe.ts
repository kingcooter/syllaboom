import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRICES = {
  single: {
    amount: 179, // $1.79
    name: 'Single Syllabus',
    description: 'One syllabus → complete study system',
  },
  semester: {
    amount: 489, // $4.89
    name: 'Semester Pack',
    description: 'Up to 6 syllabi → complete study systems',
  },
};
