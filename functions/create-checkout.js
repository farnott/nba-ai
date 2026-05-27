export async function onRequestPost(context) {
  const STRIPE_SECRET_KEY = context.env.STRIPE_SECRET_KEY;
  const DOMAIN = context.env.DOMAIN;
  const PRICE_ID = 'price_1TacHZLeyxKK4UQn1DkzlBD4';
  const COUPON_ID = 'FIRST_MONTH_1GBP';

  async function stripe(endpoint, body) {
    const method = body ? 'POST' : 'GET';
    const headers = {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const response = await fetch(`https://api.stripe.com/v1/${endpoint}`, {
      method,
      headers,
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
        amount_off: '13800',
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
      success_url: `${DOMAIN}/thank-you.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/cancelled.html`,
    });

    if (session.error) {
      return new Response(JSON.stringify({ error: session.error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
