const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { User } = require('../models');
const { isAuthenticated } = require('../middleware/auth');

// Initialize Stripe (use environment variable in production)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_TEST_KEY');

// Plan prices in cents
const PLAN_PRICES = {
    pro: {
        monthly: { amount: 999, interval: 'month' },
        yearly: { amount: 9588, interval: 'year' } // 20% discount
    },
    enterprise: {
        monthly: { amount: 2999, interval: 'month' },
        yearly: { amount: 28788, interval: 'year' } // 20% discount
    }
};

// ============ STRIPE INTEGRATION ============

// Create Stripe Checkout Session
router.post('/create-checkout-session', isAuthenticated, async (req, res) => {
    try {
        const { plan, billing } = req.body;

        if (!PLAN_PRICES[plan]) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        const priceData = PLAN_PRICES[plan][billing];
        if (!priceData) {
            return res.status(400).json({ error: 'Invalid billing period' });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Skillify ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                            description: `${billing === 'yearly' ? 'Annual' : 'Monthly'} subscription`,
                            images: ['https://skillify.com/logo.png']
                        },
                        unit_amount: priceData.amount,
                        recurring: {
                            interval: priceData.interval
                        }
                    },
                    quantity: 1
                }
            ],
            success_url: `${process.env.BASE_URL || 'http://localhost:5000'}/dashboard.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/pricing.html?payment=cancelled`,
            metadata: {
                userId: req.user.id,
                plan: plan,
                billing: billing
            }
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (err) {
        console.error('Stripe session error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Stripe Webhook - Handle subscription events
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (endpointSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } else {
            event = JSON.parse(req.body);
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;

        case 'customer.subscription.updated':
            const subscription = event.data.object;
            await handleSubscriptionUpdate(subscription);
            break;

        case 'customer.subscription.deleted':
            const cancelledSub = event.data.object;
            await handleSubscriptionCancellation(cancelledSub);
            break;

        case 'invoice.payment_failed':
            const failedInvoice = event.data.object;
            await handlePaymentFailed(failedInvoice);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
    try {
        const { userId, plan, billing } = session.metadata;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        // Calculate end date
        const endDate = new Date();
        if (billing === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Cancel any existing subscription
        await Subscription.update(
            { status: 'cancelled', cancelledAt: new Date() },
            { where: { UserId: userId, status: 'active' } }
        );

        // Create new subscription
        await Subscription.create({
            UserId: userId,
            plan: plan,
            status: 'active',
            billingPeriod: billing,
            amount: session.amount_total / 100,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            startDate: new Date(),
            endDate: endDate
        });

        console.log(`✅ Subscription created for user ${userId}: ${plan} (${billing})`);
    } catch (err) {
        console.error('Error handling successful payment:', err);
    }
}

// Handle subscription update
async function handleSubscriptionUpdate(stripeSubscription) {
    try {
        const subscription = await Subscription.findOne({
            where: { stripeSubscriptionId: stripeSubscription.id }
        });

        if (subscription) {
            subscription.status = stripeSubscription.status === 'active' ? 'active' : 'past_due';
            await subscription.save();
        }
    } catch (err) {
        console.error('Error handling subscription update:', err);
    }
}

// Handle subscription cancellation
async function handleSubscriptionCancellation(stripeSubscription) {
    try {
        await Subscription.update(
            { status: 'cancelled', cancelledAt: new Date() },
            { where: { stripeSubscriptionId: stripeSubscription.id } }
        );
    } catch (err) {
        console.error('Error handling subscription cancellation:', err);
    }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
    try {
        const subscription = await Subscription.findOne({
            where: { stripeCustomerId: invoice.customer }
        });

        if (subscription) {
            subscription.status = 'past_due';
            await subscription.save();
        }
    } catch (err) {
        console.error('Error handling failed payment:', err);
    }
}

// ============ PAYPAL INTEGRATION ============

// PayPal Client ID (use environment variable in production)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'YOUR_PAYPAL_SECRET';
const PAYPAL_API_URL = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Get PayPal access token
async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

// Create PayPal order
router.post('/create-paypal-order', isAuthenticated, async (req, res) => {
    try {
        const { plan, billing } = req.body;

        if (!PLAN_PRICES[plan]) {
            return res.status(400).json({ error: 'Invalid plan' });
        }

        const priceData = PLAN_PRICES[plan][billing];
        const amount = (priceData.amount / 100).toFixed(2);

        const accessToken = await getPayPalAccessToken();

        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    description: `Skillify ${plan} Plan - ${billing}`,
                    amount: {
                        currency_code: 'USD',
                        value: amount
                    }
                }],
                application_context: {
                    return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payment/paypal-success?plan=${plan}&billing=${billing}&userId=${req.user.id}`,
                    cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/pricing.html?payment=cancelled`
                }
            })
        });

        const order = await response.json();

        if (order.id) {
            res.json({ orderId: order.id, approvalUrl: order.links.find(l => l.rel === 'approve').href });
        } else {
            res.status(400).json({ error: 'Failed to create PayPal order' });
        }
    } catch (err) {
        console.error('PayPal order error:', err);
        res.status(500).json({ error: err.message });
    }
});

// PayPal success callback
router.get('/paypal-success', async (req, res) => {
    try {
        const { token, PayerID, plan, billing, userId } = req.query;

        const accessToken = await getPayPalAccessToken();

        // Capture the payment
        const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${token}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const capture = await response.json();

        if (capture.status === 'COMPLETED') {
            // Calculate end date
            const endDate = new Date();
            if (billing === 'yearly') {
                endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            // Cancel existing subscription
            await Subscription.update(
                { status: 'cancelled', cancelledAt: new Date() },
                { where: { UserId: userId, status: 'active' } }
            );

            // Create subscription
            const amount = capture.purchase_units[0].payments.captures[0].amount.value;
            await Subscription.create({
                UserId: userId,
                plan: plan,
                status: 'active',
                billingPeriod: billing,
                amount: parseFloat(amount),
                paypalSubscriptionId: capture.id,
                startDate: new Date(),
                endDate: endDate
            });

            res.redirect('/dashboard.html?payment=success&method=paypal');
        } else {
            res.redirect('/pricing.html?payment=failed');
        }
    } catch (err) {
        console.error('PayPal capture error:', err);
        res.redirect('/pricing.html?payment=error');
    }
});

// ============ GENERAL ENDPOINTS ============

// Get current subscription
router.get('/subscription', isAuthenticated, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            where: { UserId: req.user.id, status: 'active' }
        });

        if (!subscription) {
            return res.json({
                plan: 'free',
                status: 'active',
                features: ['3 courses', 'Basic quizzes', 'Community access']
            });
        }

        res.json(subscription);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel subscription
router.post('/cancel-subscription', isAuthenticated, async (req, res) => {
    try {
        const subscription = await Subscription.findOne({
            where: { UserId: req.user.id, status: 'active' }
        });

        if (!subscription || subscription.plan === 'free') {
            return res.status(400).json({ message: 'No active subscription to cancel' });
        }

        // Cancel on Stripe if applicable
        if (subscription.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        }

        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription cancelled. Access until ' + subscription.endDate.toLocaleDateString()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Stripe publishable key (for frontend)
router.get('/config', (req, res) => {
    res.json({
        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_TEST_KEY',
        paypalClientId: process.env.PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID'
    });
});

// Get all plans
router.get('/plans', (req, res) => {
    res.json({
        plans: [
            {
                id: 'free',
                name: 'Free',
                price: { monthly: 0, yearly: 0 },
                features: ['Access to 3 courses', 'Basic quizzes', 'Community access']
            },
            {
                id: 'pro',
                name: 'Pro',
                price: { monthly: 9.99, yearly: 95.88 },
                features: ['All courses unlocked', 'Advanced quizzes', 'Verified certificates', 'Priority support']
            },
            {
                id: 'enterprise',
                name: 'Enterprise',
                price: { monthly: 29.99, yearly: 287.88 },
                features: ['Everything in Pro', 'Team management', 'Analytics dashboard', 'API access', 'Custom branding']
            }
        ]
    });
});

module.exports = router;
