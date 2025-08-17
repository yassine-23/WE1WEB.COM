/**
 * WE1WEB Task Management Routes
 * Task creation, assignment, and monitoring
 */

import express from 'express';
import taskProcessor from '../../services/taskProcessor.js';
import taskDistributor from '../../services/taskDistributor.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Create new task
 */
router.post('/create', requireAuth, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      requesterId: req.user.id
    };
    
    const task = taskProcessor.createTask(taskData);
    
    // Distribute task to network
    const distribution = await taskDistributor.distributeTask(task);
    
    res.json({
      success: true,
      task: {
        id: task.id,
        type: task.type,
        status: task.status,
        reward: task.reward,
        createdAt: task.createdAt
      },
      distribution
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get task status
 */
router.get('/:taskId', requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskProcessor.activeTasks.get(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get user's tasks
 */
router.get('/user/tasks', requireAuth, async (req, res) => {
  try {
    const userTasks = Array.from(taskProcessor.activeTasks.values())
      .filter(task => task.requesterId === req.user.id);
    
    res.json({
      success: true,
      tasks: userTasks,
      count: userTasks.length
    });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel task
 */
router.delete('/:taskId', requireAuth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = taskProcessor.activeTasks.get(taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    if (task.requesterId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    task.status = 'cancelled';
    taskProcessor.activeTasks.delete(taskId);
    
    res.json({
      success: true,
      message: 'Task cancelled'
    });
  } catch (error) {
    console.error('Error cancelling task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get task queue status
 */
router.get('/queue/status', async (req, res) => {
  try {
    const stats = taskProcessor.getStats();
    
    res.json({
      success: true,
      queue: {
        pending: stats.pendingTasks,
        active: stats.activeTasks,
        completed: stats.completedTasks,
        workers: {
          total: stats.totalWorkers,
          active: stats.activeWorkers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get distribution statistics
 */
router.get('/distribution/stats', async (req, res) => {
  try {
    const stats = taskDistributor.getDistributionStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching distribution stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update distribution strategy
 */
router.put('/distribution/strategy', requireAuth, async (req, res) => {
  try {
    const { strategy } = req.body;
    
    // Only admins can change strategy (add admin check here)
    const result = taskDistributor.setStrategy(strategy);
    
    if (result.success) {
      res.json({
        success: true,
        strategy,
        message: `Distribution strategy updated to ${strategy}`
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error updating strategy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;