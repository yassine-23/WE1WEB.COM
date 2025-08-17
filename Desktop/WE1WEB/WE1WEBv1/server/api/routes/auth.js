/**
 * WE1WEB Authentication Routes
 * User registration, login, and session management
 */

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (authError) throw authError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        email,
        display_name: displayName
      });

    if (profileError) throw profileError;

    // Initialize user balance
    const { error: balanceError } = await supabase
      .from('user_balances')
      .insert({
        user_id: authData.user.id,
        balance: 0,
        pending_balance: 0,
        total_earned: 0,
        total_withdrawn: 0,
        tasks_completed: 0
      });

    if (balanceError) throw balanceError;

    res.status(201).json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        displayName
      },
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * User login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        displayName: profile?.display_name
      },
      session: data.session
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid credentials'
    });
  }
});

/**
 * Logout
 */
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      await supabase.auth.signOut();
    }
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Verify session
 */
router.get('/session', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid session'
    });
  }
});

/**
 * Password reset request
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update password
 */
router.post('/update-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;