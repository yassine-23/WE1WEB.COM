/**
 * WE1WEB Payment System
 * Handles Stripe payments, user earnings, and payouts
 */

import Stripe from 'stripe';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const router = express.Router();

// User earnings tracking
class EarningsManager {
  constructor() {
    this.userEarnings = new Map(); // userId -> earnings data
    this.pendingPayouts = new Map(); // userId -> pending amount
    this.minimumPayout = 10; // Minimum $10 for payout
  }

  async recordTaskCompletion(userId, taskId, taskType, reward) {
    try {
      // Record in database
      const { data, error } = await supabase
        .from('task_completions')
        .insert({
          user_id: userId,
          task_id: taskId,
          task_type: taskType,
          reward: reward,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update in-memory tracking
      this.addEarnings(userId, reward);

      // Update user's total earnings
      await this.updateUserBalance(userId, reward);

      return { success: true, earnings: reward };
    } catch (error) {
      console.error('Error recording task completion:', error);
      return { success: false, error: error.message };
    }
  }

  addEarnings(userId, amount) {
    const current = this.userEarnings.get(userId) || {
      total: 0,
      pending: 0,
      paid: 0,
      tasks: 0
    };

    current.total += amount;
    current.pending += amount;
    current.tasks += 1;

    this.userEarnings.set(userId, current);
  }

  async updateUserBalance(userId, amount) {
    try {
      // Get current balance
      const { data: user, error: fetchError } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (user) {
        // Update existing balance
        const { error: updateError } = await supabase
          .from('user_balances')
          .update({
            balance: user.balance + amount,
            pending_balance: user.pending_balance + amount,
            total_earned: user.total_earned + amount,
            tasks_completed: user.tasks_completed + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      } else {
        // Create new balance record
        const { error: insertError } = await supabase
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: amount,
            pending_balance: amount,
            total_earned: amount,
            total_withdrawn: 0,
            tasks_completed: 1,
            created_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  async getUserEarnings(userId) {
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        balance: 0,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        tasks_completed: 0
      };
    } catch (error) {
      console.error('Error fetching user earnings:', error);
      return null;
    }
  }

  canRequestPayout(earnings) {
    return earnings && earnings.pending_balance >= this.minimumPayout;
  }
}

// Stripe Connect for user payouts
class PayoutManager {
  async createConnectedAccount(userId, email, country = 'DE') {
    try {
      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: country,
        email: email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          product_description: 'AI training data generation and computing power contribution'
        }
      });

      // Save account ID to database
      const { error } = await supabase
        .from('stripe_accounts')
        .insert({
          user_id: userId,
          stripe_account_id: account.id,
          email: email,
          country: country,
          status: 'pending_verification',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/payment-setup?retry=true`,
        return_url: `${process.env.FRONTEND_URL}/payment-setup?success=true`,
        type: 'account_onboarding',
      });

      return {
        success: true,
        accountId: account.id,
        onboardingUrl: accountLink.url
      };
    } catch (error) {
      console.error('Error creating connected account:', error);
      return { success: false, error: error.message };
    }
  }

  async processPayout(userId, amount) {
    try {
      // Get user's Stripe account
      const { data: stripeAccount, error: accountError } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (accountError || !stripeAccount) {
        throw new Error('No payment account found. Please set up your payment method.');
      }

      // Check if account is verified
      const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id);
      if (!account.charges_enabled || !account.payouts_enabled) {
        throw new Error('Payment account not fully verified. Please complete verification.');
      }

      // Create transfer to connected account
      const transfer = await stripe.transfers.create({
        amount: Math.floor(amount * 100), // Convert to cents
        currency: 'eur',
        destination: stripeAccount.stripe_account_id,
        description: `WE1WEB earnings payout for user ${userId}`,
        metadata: {
          user_id: userId,
          payout_date: new Date().toISOString()
        }
      });

      // Record payout in database
      const { error: payoutError } = await supabase
        .from('payouts')
        .insert({
          user_id: userId,
          amount: amount,
          currency: 'EUR',
          stripe_transfer_id: transfer.id,
          status: 'completed',
          processed_at: new Date().toISOString()
        });

      if (payoutError) throw payoutError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({
          pending_balance: 0,
          total_withdrawn: supabase.raw('total_withdrawn + ?', [amount]),
          last_payout_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (balanceError) throw balanceError;

      return {
        success: true,
        transferId: transfer.id,
        amount: amount
      };
    } catch (error) {
      console.error('Error processing payout:', error);
      return { success: false, error: error.message };
    }
  }

  async getPayoutHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', userId)
        .order('processed_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching payout history:', error);
      return [];
    }
  }
}

// Task pricing configuration
const TASK_PRICING = {
  human_feedback: { min: 0.15, max: 0.25, average: 0.20 },
  synthetic_conv: { min: 0.20, max: 0.40, average: 0.30 },
  code_review: { min: 0.30, max: 0.50, average: 0.40 },
  multimodal: { min: 0.25, max: 0.45, average: 0.35 },
  fact_check: { min: 0.35, max: 0.60, average: 0.45 },
  edge_cases: { min: 0.40, max: 0.80, average: 0.60 },
  translation: { min: 0.30, max: 0.50, average: 0.40 },
  preferences: { min: 0.20, max: 0.35, average: 0.25 }
};

// Initialize managers
const earningsManager = new EarningsManager();
const payoutManager = new PayoutManager();

// API Routes

// Record task completion and earnings
router.post('/task/complete', async (req, res) => {
  const { userId, taskId, taskType, quality = 1.0 } = req.body;

  if (!userId || !taskId || !taskType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Calculate reward based on task type and quality
  const pricing = TASK_PRICING[taskType];
  if (!pricing) {
    return res.status(400).json({ error: 'Invalid task type' });
  }

  const baseReward = pricing.average;
  const qualityMultiplier = Math.min(Math.max(quality, 0.5), 1.5); // 0.5x to 1.5x
  const finalReward = baseReward * qualityMultiplier;

  const result = await earningsManager.recordTaskCompletion(
    userId,
    taskId,
    taskType,
    finalReward
  );

  if (result.success) {
    res.json({
      success: true,
      earnings: finalReward,
      message: `Earned €${finalReward.toFixed(3)} for completing task`
    });
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Get user earnings
router.get('/earnings/:userId', async (req, res) => {
  const earnings = await earningsManager.getUserEarnings(req.params.userId);
  
  if (earnings) {
    res.json({
      ...earnings,
      canRequestPayout: earningsManager.canRequestPayout(earnings),
      minimumPayout: earningsManager.minimumPayout
    });
  } else {
    res.status(404).json({ error: 'User earnings not found' });
  }
});

// Set up payment account (Stripe Connect)
router.post('/payment/setup', async (req, res) => {
  const { userId, email, country } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await payoutManager.createConnectedAccount(userId, email, country);
  
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Request payout
router.post('/payout/request', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing user ID' });
  }

  // Get user earnings
  const earnings = await earningsManager.getUserEarnings(userId);
  
  if (!earnings) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!earningsManager.canRequestPayout(earnings)) {
    return res.status(400).json({ 
      error: `Minimum payout is €${earningsManager.minimumPayout}. Current balance: €${earnings.pending_balance.toFixed(2)}` 
    });
  }

  // Process payout
  const result = await payoutManager.processPayout(userId, earnings.pending_balance);
  
  if (result.success) {
    res.json({
      success: true,
      amount: result.amount,
      transferId: result.transferId,
      message: `Payout of €${result.amount.toFixed(2)} processed successfully`
    });
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Get payout history
router.get('/payout/history/:userId', async (req, res) => {
  const history = await payoutManager.getPayoutHistory(req.params.userId);
  res.json(history);
});

// Webhook handler for Stripe events
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'account.updated':
      const account = event.data.object;
      // Update account status in database
      await supabase
        .from('stripe_accounts')
        .update({
          status: account.charges_enabled ? 'active' : 'pending_verification',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_account_id', account.id);
      break;

    case 'transfer.created':
      const transfer = event.data.object;
      console.log('Transfer created:', transfer.id);
      break;

    case 'payout.paid':
      const payout = event.data.object;
      console.log('Payout completed:', payout.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// Statistics endpoint
router.get('/stats', async (req, res) => {
  try {
    // Get platform statistics
    const { data: stats, error } = await supabase
      .from('user_balances')
      .select('total_earned, tasks_completed')
      .single();

    if (error) throw error;

    // Calculate totals
    const totalEarned = stats?.reduce((sum, user) => sum + user.total_earned, 0) || 0;
    const totalTasks = stats?.reduce((sum, user) => sum + user.tasks_completed, 0) || 0;

    res.json({
      totalEarned,
      totalTasks,
      averageEarningPerTask: totalTasks > 0 ? totalEarned / totalTasks : 0,
      activeUsers: stats?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;