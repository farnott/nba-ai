export default {
  async fetch(request, env) {
    const allowedOrigins = [
      'https://nba-ai.co.uk',
      'https://www.nba-ai.co.uk',
      'https://nba-website.pages.dev',
    ];
    const origin = request.headers.get('Origin');
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    // -------------------------------------------------------
    // Flip MODE to 'test' or 'live' in Worker env variables
    // -------------------------------------------------------
    const MODE = env.MODE || 'live';
    const isTest = MODE === 'test';
    const STRIPE_SECRET_KEY = isTest ? env.STRIPE_TEST_SECRET_KEY : env.STRIPE_LIVE_SECRET_KEY;
    const PRICE_ID = isTest ? env.STRIPE_TEST_PRICE_ID : env.STRIPE_LIVE_PRICE_ID;
    const COUPON_ID = isTest ? 'TEST_FIRST_MONTH_1GBP' : 'wlMgMHe3';
    const DOMAIN = env.DOMAIN;
    async function stripe(endpoint, body) {
      const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body ? new URLSearchParams(body) : undefined,
      });
      return response.json();
    }
    try {
      // Get or create coupon
      let coupon = await stripe(`coupons/${COUPON_ID}`);
      if (coupon.error) {
        coupon = await stripe('coupons', {
          id: COUPON_ID,
          amount_off: '14800',
          currency: 'gbp',
          duration: 'once',
          name: 'First month — pay just £1',
        });
      }
      // Create checkout session
      const session = await stripe('checkout/sessions', {
        mode: 'subscription',
        'payment_method_types[]': 'card',
        'line_items[0][price]': PRICE_ID,
        'line_items[0][quantity]': '1',
        'discounts[0][coupon]': COUPON_ID,
        'automatic_tax[enabled]': 'true',
        'custom_fields[0][key]': 'first_name',
        'custom_fields[0][label][type]': 'custom',
        'custom_fields[0][label][custom]': 'First name (to personalise your account)',
        'custom_fields[0][optional]': 'false',
        'custom_fields[0][type]': 'text',
        'custom_fields[1][key]': 'business_name',
        'custom_fields[1][label][type]': 'custom',
        'custom_fields[1][label][custom]': 'Business name (to set up your AI assistant)',
        'custom_fields[1][optional]': 'false',
        'custom_fields[1][type]': 'text',
        success_url: `${DOMAIN}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${DOMAIN}/cancelled.html`,
      });
      if (session.error) {
        return new Response(JSON.stringify({ error: session.error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
          },
        });
      }
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }
  }
};
