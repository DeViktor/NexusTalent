import Stripe from 'stripe';

const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const API_VERSION: Stripe.StripeConfig['apiVersion'] = '2022-11-15';

export const stripe: Stripe | any = STRIPE_API_KEY
  ? new Stripe(STRIPE_API_KEY, { apiVersion: API_VERSION, typescript: true })
  : {
      checkout: {
        sessions: {
          async create() {
            throw new Error('Stripe não configurado: defina STRIPE_SECRET_KEY nas variáveis de ambiente');
          },
        },
      },
      webhooks: {
        constructEvent() {
          throw new Error('Stripe não configurado: defina STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET');
        },
      },
    };
