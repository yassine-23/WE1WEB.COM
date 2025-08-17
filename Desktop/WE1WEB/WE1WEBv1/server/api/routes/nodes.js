/**
 * WE1WEB Node Management Routes
 * Device registration and management endpoints
 */

import express from 'express';
import nodeManager from '../../services/nodeManager.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get user's nodes
 */
router.get('/my-nodes', requireAuth, async (req, res) => {
  try {
    const nodes = nodeManager.getNodesByUser(req.user.id);
    
    res.json({
      success: true,
      nodes,
      count: nodes.length
    });
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Register new node
 */
router.post('/register', requireAuth, async (req, res) => {
  try {
    const result = await nodeManager.connectNode(
      req.user.id,
      req.body.deviceInfo,
      req.body.socketId
    );
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Node registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Update node status
 */
router.put('/:nodeId/status', requireAuth, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { status } = req.body;
    
    const node = nodeManager.connectedNodes.get(nodeId);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }
    
    if (node.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    node.status = status;
    
    res.json({
      success: true,
      node: nodeManager.sanitizeNodeData(node)
    });
  } catch (error) {
    console.error('Error updating node status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get node statistics
 */
router.get('/:nodeId/stats', requireAuth, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const node = nodeManager.connectedNodes.get(nodeId);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }
    
    if (node.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const stats = {
      ...nodeManager.sanitizeNodeData(node),
      metrics: nodeManager.nodeMetrics.get(nodeId) || {},
      earnings: node.session.earnings,
      tasksCompleted: node.session.tasksCompleted,
      uptime: Date.now() - node.session.connectedAt.getTime()
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching node stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Disconnect node
 */
router.delete('/:nodeId', requireAuth, async (req, res) => {
  try {
    const { nodeId } = req.params;
    const node = nodeManager.connectedNodes.get(nodeId);
    
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }
    
    if (node.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    const result = await nodeManager.disconnectNode(nodeId);
    
    res.json(result);
  } catch (error) {
    console.error('Error disconnecting node:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get network statistics
 */
router.get('/network/stats', async (req, res) => {
  try {
    const stats = nodeManager.getNetworkStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching network stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;