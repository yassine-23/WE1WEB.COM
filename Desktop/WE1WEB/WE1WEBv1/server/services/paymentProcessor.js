/**
 * WE1WEB Payment Processing System
 * Handles Stripe payments and user earnings distribution
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class PaymentProcessor {
  constructor() {
    this.minimumPayout = parseFloat(process.env.MINIMUM_PAYOUT_EUR) || 10.00;
    this.currency = 'eur';
    this.payoutQueue = [];
    this.processingPayouts = false;
  }

  /**
   * Create or retrieve Stripe Connect account for user
   */
  async createConnectAccount(userId, email, country = 'DE') {
    try {
      // Check if user already has a Stripe account
      const { data: existingAccount } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingAccount?.stripe_account_id) {
        // Retrieve existing account from Stripe
        const account = await stripe.accounts.retrieve(existingAccount.stripe_account_id);
        return {
          success: true,
          account: account,
          isNew: false
        };
      }

      // Create new Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: country,
        email: email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          userId: userId,
          platform: 'WE1WEB'
        }
      });

      // Save to database
      const { error: dbError } = await supabase
        .from('stripe_accounts')
        .insert({
          user_id: userId,
          stripe_account_id: account.id,
          email: email,
          country: country,
          status: 'pending_verification'
        });

      if (dbError) throw dbError;

      return {
        success: true,
        account: account,
        isNew: true
      };
    } catch (error) {
      console.error('Error creating Connect account:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create account link for onboarding
   */
  async createAccountLink(accountId, userId) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.FRONTEND_URL}/dashboard/payments/refresh`,
        return_url: `${process.env.FRONTEND_URL}/dashboard/payments/success`,
        type: 'account_onboarding',
      });

      return {
        success: true,
        url: accountLink.url
      };
    } catch (error) {
      console.error('Error creating account link:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check account verification status
   */
  async checkAccountStatus(userId) {
    try {
      const { data: stripeAccount } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!stripeAccount) {
        return {
          success: false,
          error: 'No Stripe account found'
        };
      }

      const account = await stripe.accounts.retrieve(stripeAccount.stripe_account_id);

      // Update database with latest status
      await supabase
        .from('stripe_accounts')
        .update({
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending_verification'
        })
        .eq('user_id', userId);

      return {
        success: true,
        account: {
          id: account.id,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          requirements: account.requirements,
          status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending_verification'
        }
      };
    } catch (error) {
      console.error('Error checking account status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process payout for user
   */
  async processPayout(userId) {
    try {
      // Get user balance
      const { data: balance } = await supabase
        .from('user_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!balance) {
        return {
          success: false,
          error: 'No balance found'
        };
      }

      if (balance.pending_balance < this.minimumPayout) {
        return {
          success: false,
          error: `Minimum payout is ${this.minimumPayout} EUR`
        };
      }

      // Get Stripe account
      const { data: stripeAccount } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!stripeAccount || !stripeAccount.payouts_enabled) {
        return {
          success: false,
          error: 'Stripe account not verified'
        };
      }

      // Create transfer to Connect account
      const transfer = await stripe.transfers.create({
        amount: Math.floor(balance.pending_balance * 100), // Convert to cents
        currency: this.currency,
        destination: stripeAccount.stripe_account_id,
        description: `WE1WEB earnings payout for user ${userId}`,
        metadata: {
          userId: userId,
          type: 'earnings_payout'
        }
      });

      // Create payout from Connect account to bank
      const payout = await stripe.payouts.create(
        {
          amount: Math.floor(balance.pending_balance * 100),
          currency: this.currency,
          description: 'WE1WEB earnings',
          metadata: {
            userId: userId
          }
        },
        {
          stripeAccount: stripeAccount.stripe_account_id,
        }
      );

      // Record payout in database
      await supabase
        .from('payouts')
        .insert({
          user_id: userId,
          amount: balance.pending_balance,
          currency: this.currency,
          stripe_transfer_id: transfer.id,
          stripe_payout_id: payout.id,
          status: 'processing',
          method: 'bank_transfer',
          processed_at: new Date()
        });

      // Update user balance
      await supabase
        .from('user_balances')
        .update({
          pending_balance: 0,
          total_withdrawn: balance.total_withdrawn + balance.pending_balance,
          last_payout_at: new Date()
        })
        .eq('user_id', userId);

      return {
        success: true,
        payout: {
          amount: balance.pending_balance,
          currency: this.currency,
          status: 'processing',
          transferId: transfer.id,
          payoutId: payout.id
        }
      };
    } catch (error) {
      console.error('Error processing payout:', error);
      
      // Record failed payout
      await supabase
        .from('payouts')
        .insert({
          user_id: userId,
          amount: 0,
          currency: this.currency,
          status: 'failed',
          failed_reason: error.message,
          processed_at: new Date()
        });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user earnings summary
   */
  async getUserEarnings(userId) {
    try {
      const { data: earnings } = await supabase
        .rpc('get_user_earnings_summary', {
          p_user_id: userId
        });

      if (!earnings || earnings.length === 0) {
        // Create initial balance record
        await supabase
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: 0,
            pending_balance: 0,
            total_earned: 0,
            total_withdrawn: 0,
            tasks_completed: 0
          });

        return {
          success: true,
          earnings: {
            balance: 0,
            pending_balance: 0,
            total_earned: 0,
            total_withdrawn: 0,
            tasks_completed: 0,
            can_request_payout: false,
            minimum_payout: this.minimumPayout
          }
        };
      }

      return {
        success: true,
        earnings: earnings[0]
      };
    } catch (error) {
      console.error('Error getting user earnings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payout history for user
   */
  async getPayoutHistory(userId, limit = 10) {
    try {
      const { data: payouts, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        success: true,
        payouts: payouts || []
      };
    } catch (error) {
      console.error('Error getting payout history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object);
          break;
        
        case 'payout.failed':
          await this.handlePayoutFailed(event.data.object);
          break;
        
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object);
          break;
        
        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle successful payout
   */
  async handlePayoutPaid(payout) {
    await supabase
      .from('payouts')
      .update({
        status: 'completed'
      })
      .eq('stripe_payout_id', payout.id);
  }

  /**
   * Handle failed payout
   */
  async handlePayoutFailed(payout) {
    await supabase
      .from('payouts')
      .update({
        status: 'failed',
        failed_reason: payout.failure_message
      })
      .eq('stripe_payout_id', payout.id);

    // Restore user balance
    const { data: payoutRecord } = await supabase
      .from('payouts')
      .select('user_id, amount')
      .eq('stripe_payout_id', payout.id)
      .single();

    if (payoutRecord) {
      await supabase
        .from('user_balances')
        .update({
          pending_balance: supabase.raw('pending_balance + ?', [payoutRecord.amount])
        })
        .eq('user_id', payoutRecord.user_id);
    }
  }

  /**
   * Handle Stripe account updates
   */
  async handleAccountUpdated(account) {
    await supabase
      .from('stripe_accounts')
      .update({
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        status: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending_verification'
      })
      .eq('stripe_account_id', account.id);
  }

  /**
   * Process batch payouts
   */
  async processBatchPayouts() {
    if (this.processingPayouts) return;
    
    this.processingPayouts = true;

    try {
      // Get users with pending payouts above minimum
      const { data: eligibleUsers } = await supabase
        .from('user_balances')
        .select('user_id')
        .gte('pending_balance', this.minimumPayout);

      if (!eligibleUsers || eligibleUsers.length === 0) {
        return { success: true, processed: 0 };
      }

      let processed = 0;
      let failed = 0;

      for (const user of eligibleUsers) {
        const result = await this.processPayout(user.user_id);
        if (result.success) {
          processed++;
        } else {
          failed++;
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      return {
        success: true,
        processed,
        failed
      };
    } finally {
      this.processingPayouts = false;
    }
  }

  /**
   * Calculate platform fees
   */
  calculatePlatformFee(amount) {
    const feePercentage = 0.1; // 10% platform fee
    return {
      platformFee: amount * feePercentage,
      userAmount: amount * (1 - feePercentage)
    };
  }
}

export default new PaymentProcessor();