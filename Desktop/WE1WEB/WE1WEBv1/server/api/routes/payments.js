/**
 * WE1WEB Payment Routes
 * Stripe integration and earnings management
 */

import express from 'express';
import paymentProcessor from '../../services/paymentProcessor.js';
import { requireAuth } from '../middleware/auth.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

/**
 * Get user earnings
 */
router.get('/earnings', requireAuth, async (req, res) => {
  try {
    const earnings = await paymentProcessor.getUserEarnings(req.user.id);
    res.json(earnings);
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get payout history
 */
router.get('/payouts', requireAuth, async (req, res) => {
  try {
    const payouts = await paymentProcessor.getPayoutHistory(req.user.id);
    res.json(payouts);
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Create Stripe Connect account
 */
router.post('/connect/create', requireAuth, async (req, res) => {
  try {
    const { email, country } = req.body;
    const result = await paymentProcessor.createConnectAccount(
      req.user.id,
      email || req.user.email,
      country
    );
    
    if (result.success && result.isNew) {
      // Create onboarding link
      const link = await paymentProcessor.createAccountLink(
        result.account.id,
        req.user.id
      );
      
      res.json({
        success: true,
        account: result.account,
        onboardingUrl: link.url
      });
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error creating Connect account:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get Stripe account status
 */
router.get('/connect/status', requireAuth, async (req, res) => {
  try {
    const status = await paymentProcessor.checkAccountStatus(req.user.id);
    res.json(status);
  } catch (error) {
    console.error('Error checking account status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Request payout
 */
router.post('/payout/request', requireAuth, async (req, res) => {
  try {
    const result = await paymentProcessor.processPayout(req.user.id);
    
    if (result.success) {
      res.json({
        success: true,
        payout: result.payout,
        message: 'Payout initiated successfully'
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error processing payout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Stripe webhook handler
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    const result = await paymentProcessor.handleWebhook(event);
    
    if (result.success) {
      res.json({ received: true });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * Get platform fees
 */
router.get('/fees', async (req, res) => {
  try {
    res.json({
      success: true,
      fees: {
        platform: 0.1, // 10%
        minimum_payout: paymentProcessor.minimumPayout,
        currency: paymentProcessor.currency
      }
    });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;