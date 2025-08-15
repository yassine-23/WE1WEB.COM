-- Create nodes table for device registration
CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- desktop, laptop, mobile, server
  os VARCHAR(100),
  cpu_cores INTEGER,
  cpu_speed DECIMAL(4, 2), -- GHz
  memory_gb DECIMAL(6, 2),
  gpu_model VARCHAR(255),
  gpu_memory_gb DECIMAL(6, 2),
  bandwidth_mbps DECIMAL(8, 2),
  location_country VARCHAR(2),
  location_city VARCHAR(100),
  status VARCHAR(20) DEFAULT 'offline', -- online, offline, busy, maintenance
  reliability_score DECIMAL(5, 2) DEFAULT 100.00,
  total_tasks_completed INTEGER DEFAULT 0,
  total_compute_hours DECIMAL(10, 2) DEFAULT 0,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_nodes_status (status),
  INDEX idx_nodes_user (user_id),
  INDEX idx_nodes_location (location_country)
);

-- Create pools table for compute pools
CREATE TABLE IF NOT EXISTS pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'public', -- public, private, enterprise
  min_devices INTEGER DEFAULT 1,
  max_devices INTEGER DEFAULT 1000,
  current_devices INTEGER DEFAULT 0,
  governance_model VARCHAR(50) DEFAULT 'democratic', -- democratic, stake-weighted, owner-controlled
  reward_distribution VARCHAR(50) DEFAULT 'proportional', -- equal, proportional, performance-based
  task_types TEXT[], -- Array of allowed task types
  entry_requirements JSONB, -- Min specs, location, etc.
  status VARCHAR(20) DEFAULT 'active', -- active, paused, archived
  total_compute_hours DECIMAL(12, 2) DEFAULT 0,
  total_rewards_distributed DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_pools_owner (owner_id),
  INDEX idx_pools_status (status),
  INDEX idx_pools_type (type)
);

-- Create pool_members table for pool membership
CREATE TABLE IF NOT EXISTS pool_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, admin, member
  contribution_percent DECIMAL(5, 2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  compute_hours DECIMAL(10, 2) DEFAULT 0,
  rewards_earned DECIMAL(10, 2) DEFAULT 0,
  voting_power DECIMAL(5, 2) DEFAULT 1.00,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(pool_id, user_id, node_id),
  INDEX idx_pool_members_pool (pool_id),
  INDEX idx_pool_members_user (user_id)
);

-- Create tasks table for compute tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(255) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, processing, completed, failed
  requester_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pool_id UUID REFERENCES pools(id) ON DELETE SET NULL,
  payload JSONB,
  requirements JSONB, -- CPU, memory, bandwidth requirements
  reward_amount DECIMAL(10, 4),
  reward_currency VARCHAR(3) DEFAULT 'EUR',
  deadline TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES nodes(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  validation_method VARCHAR(50) DEFAULT 'consensus',
  validation_threshold DECIMAL(3, 2) DEFAULT 0.75,
  validation_status VARCHAR(20), -- pending, passed, failed
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_tasks_status (status),
  INDEX idx_tasks_pool (pool_id),
  INDEX idx_tasks_assigned (assigned_to),
  INDEX idx_tasks_priority_status (priority, status)
);

-- Create task_votes table for democratic task selection
CREATE TABLE IF NOT EXISTS task_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL,
  vote_weight DECIMAL(5, 2) DEFAULT 1.00,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pool_id, user_id, task_type),
  INDEX idx_task_votes_pool (pool_id)
);

-- Create network_stats table for global metrics
CREATE TABLE IF NOT EXISTS network_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,
  total_nodes INTEGER DEFAULT 0,
  active_nodes INTEGER DEFAULT 0,
  total_pools INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_compute_hours DECIMAL(12, 2) DEFAULT 0,
  total_rewards_distributed DECIMAL(12, 2) DEFAULT 0,
  average_task_time INTEGER, -- seconds
  network_utilization DECIMAL(5, 2), -- percentage
  total_bandwidth_gb DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nodes
CREATE POLICY "Users can view own nodes" ON nodes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own nodes" ON nodes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nodes" ON nodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pools
CREATE POLICY "Anyone can view public pools" ON pools
  FOR SELECT USING (type = 'public' OR owner_id = auth.uid());

CREATE POLICY "Owners can manage their pools" ON pools
  FOR ALL USING (owner_id = auth.uid());

-- RLS Policies for pool_members
CREATE POLICY "Pool members can view membership" ON pool_members
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM pools WHERE pools.id = pool_members.pool_id AND pools.owner_id = auth.uid()
  ));

-- RLS Policies for tasks
CREATE POLICY "Pool members can view pool tasks" ON tasks
  FOR SELECT USING (
    requester_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM pool_members 
      WHERE pool_members.pool_id = tasks.pool_id 
      AND pool_members.user_id = auth.uid()
    )
  );

-- RLS Policies for task_votes
CREATE POLICY "Users can manage own votes" ON task_votes
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for network_stats (public read)
CREATE POLICY "Anyone can view network stats" ON network_stats
  FOR SELECT USING (true);

-- Update triggers
CREATE TRIGGER update_nodes_updated_at BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pools_updated_at BEFORE UPDATE ON pools
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to register a new node
CREATE OR REPLACE FUNCTION register_node(
  p_user_id UUID,
  p_device_id VARCHAR,
  p_device_info JSONB
)
RETURNS UUID AS $$
DECLARE
  v_node_id UUID;
BEGIN
  INSERT INTO nodes (
    user_id, 
    device_id, 
    device_name,
    device_type,
    os,
    cpu_cores,
    cpu_speed,
    memory_gb,
    gpu_model,
    gpu_memory_gb,
    bandwidth_mbps,
    location_country,
    status,
    last_seen_at
  ) VALUES (
    p_user_id,
    p_device_id,
    p_device_info->>'device_name',
    p_device_info->>'device_type',
    p_device_info->>'os',
    (p_device_info->>'cpu_cores')::INTEGER,
    (p_device_info->>'cpu_speed')::DECIMAL,
    (p_device_info->>'memory_gb')::DECIMAL,
    p_device_info->>'gpu_model',
    (p_device_info->>'gpu_memory_gb')::DECIMAL,
    (p_device_info->>'bandwidth_mbps')::DECIMAL,
    p_device_info->>'location_country',
    'online',
    NOW()
  )
  ON CONFLICT (device_id) DO UPDATE
  SET 
    status = 'online',
    last_seen_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_node_id;
  
  RETURN v_node_id;
END;
$$ LANGUAGE plpgsql;

-- Function to join a pool
CREATE OR REPLACE FUNCTION join_pool(
  p_user_id UUID,
  p_pool_id UUID,
  p_node_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if pool exists and is active
  IF NOT EXISTS (SELECT 1 FROM pools WHERE id = p_pool_id AND status = 'active') THEN
    RETURN FALSE;
  END IF;
  
  -- Insert member
  INSERT INTO pool_members (pool_id, user_id, node_id)
  VALUES (p_pool_id, p_user_id, p_node_id)
  ON CONFLICT (pool_id, user_id, node_id) DO NOTHING;
  
  -- Update pool device count
  UPDATE pools 
  SET current_devices = (
    SELECT COUNT(DISTINCT node_id) 
    FROM pool_members 
    WHERE pool_id = p_pool_id AND left_at IS NULL
  )
  WHERE id = p_pool_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to assign task to node
CREATE OR REPLACE FUNCTION assign_task_to_node(
  p_task_id UUID,
  p_node_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE tasks
  SET 
    status = 'assigned',
    assigned_to = p_node_id,
    assigned_at = NOW(),
    updated_at = NOW()
  WHERE id = p_task_id 
    AND status = 'pending'
    AND assigned_to IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to update network stats (run daily)
CREATE OR REPLACE FUNCTION update_network_stats()
RETURNS VOID AS $$
BEGIN
  INSERT INTO network_stats (
    stat_date,
    total_nodes,
    active_nodes,
    total_pools,
    total_users,
    tasks_completed,
    total_compute_hours,
    total_rewards_distributed
  )
  SELECT
    CURRENT_DATE,
    COUNT(DISTINCT n.id),
    COUNT(DISTINCT n.id) FILTER (WHERE n.status = 'online'),
    COUNT(DISTINCT p.id),
    COUNT(DISTINCT u.id),
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'completed'),
    COALESCE(SUM(n.total_compute_hours), 0),
    COALESCE(SUM(ub.total_earned), 0)
  FROM nodes n
  CROSS JOIN pools p
  CROSS JOIN auth.users u
  CROSS JOIN tasks t
  CROSS JOIN user_balances ub
  ON CONFLICT (stat_date) DO UPDATE
  SET
    total_nodes = EXCLUDED.total_nodes,
    active_nodes = EXCLUDED.active_nodes,
    total_pools = EXCLUDED.total_pools,
    total_users = EXCLUDED.total_users,
    tasks_completed = EXCLUDED.tasks_completed,
    total_compute_hours = EXCLUDED.total_compute_hours,
    total_rewards_distributed = EXCLUDED.total_rewards_distributed,
    created_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE nodes IS 'Registered compute devices in the network';
COMMENT ON TABLE pools IS 'Compute pools for collaborative processing';
COMMENT ON TABLE pool_members IS 'Membership and contribution tracking for pools';
COMMENT ON TABLE tasks IS 'Compute tasks distributed across the network';
COMMENT ON TABLE task_votes IS 'Democratic voting for task selection in pools';
COMMENT ON TABLE network_stats IS 'Daily aggregate statistics for the entire network';