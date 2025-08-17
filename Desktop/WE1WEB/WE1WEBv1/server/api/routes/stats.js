/**
 * WE1WEB Statistics Routes
 * Network and performance metrics
 */

import express from 'express';
import nodeManager from '../../services/nodeManager.js';
import taskProcessor from '../../services/taskProcessor.js';
import taskDistributor from '../../services/taskDistributor.js';
import webrtcManager from '../../services/webrtcManager.js';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Get overall network statistics
 */
router.get('/network', async (req, res) => {
  try {
    const nodeStats = nodeManager.getNetworkStats();
    const taskStats = taskProcessor.getStats();
    const distributionStats = taskDistributor.getDistributionStats();
    const connections = webrtcManager.getActiveConnections();
    
    // Get database stats
    const { data: dbStats } = await supabase
      .from('network_stats')
      .select('*')
      .order('stat_date', { ascending: false })
      .limit(1)
      .single();
    
    res.json({
      success: true,
      stats: {
        nodes: nodeStats,
        tasks: taskStats,
        distribution: distributionStats,
        webrtc: {
          activeConnections: connections.length,
          connections
        },
        database: dbStats || {},
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get historical statistics
 */
router.get('/history', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const { data: history, error } = await supabase
      .from('network_stats')
      .select('*')
      .gte('stat_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('stat_date', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      history: history || [],
      days: parseInt(days)
    });
  } catch (error) {
    console.error('Error fetching historical stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get pool statistics
 */
router.get('/pools', async (req, res) => {
  try {
    const { data: pools, error } = await supabase
      .from('pools')
      .select(`
        *,
        pool_members(count)
      `)
      .eq('status', 'active')
      .order('total_rewards_distributed', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    res.json({
      success: true,
      pools: pools || [],
      count: pools?.length || 0
    });
  } catch (error) {
    console.error('Error fetching pool stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'earnings' } = req.query;
    
    let query;
    
    switch (type) {
      case 'earnings':
        query = supabase
          .from('user_balances')
          .select(`
            user_id,
            total_earned,
            tasks_completed,
            user_profiles!inner(display_name, email)
          `)
          .order('total_earned', { ascending: false });
        break;
      
      case 'tasks':
        query = supabase
          .from('user_balances')
          .select(`
            user_id,
            tasks_completed,
            total_earned,
            user_profiles!inner(display_name, email)
          `)
          .order('tasks_completed', { ascending: false });
        break;
      
      case 'nodes':
        query = supabase
          .from('nodes')
          .select(`
            user_id,
            total_tasks_completed,
            total_compute_hours,
            reliability_score
          `)
          .order('total_compute_hours', { ascending: false });
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid leaderboard type'
        });
    }
    
    const { data: leaderboard, error } = await query.limit(100);
    
    if (error) throw error;
    
    res.json({
      success: true,
      type,
      leaderboard: leaderboard || []
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get real-time metrics
 */
router.get('/realtime', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      nodes: {
        online: nodeManager.getNetworkStats().onlineNodes,
        processing: nodeManager.getNetworkStats().processingNodes
      },
      tasks: {
        pending: taskProcessor.taskQueue.length,
        active: taskProcessor.activeTasks.size
      },
      throughput: {
        tasksPerMinute: 0, // Calculate from recent completions
        dataProcessed: 0 // Calculate from metrics
      }
    };
    
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error fetching realtime metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;