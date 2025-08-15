-- Create user_balances table for tracking earnings
CREATE TABLE IF NOT EXISTS user_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  pending_balance DECIMAL(10, 2) DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0,
  total_withdrawn DECIMAL(10, 2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  last_payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create task_completions table for tracking completed tasks
CREATE TABLE IF NOT EXISTS task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id VARCHAR(255) NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  reward DECIMAL(10, 4) NOT NULL,
  quality_score DECIMAL(3, 2) DEFAULT 1.0,
  pool_id VARCHAR(255),
  validation_status VARCHAR(20) DEFAULT 'pending', -- pending, validated, rejected
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_user_tasks (user_id, completed_at DESC),
  INDEX idx_task_type (task_type)
);

-- Create stripe_accounts table for Stripe Connect integration
CREATE TABLE IF NOT EXISTS stripe_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  country VARCHAR(2) DEFAULT 'DE',
  status VARCHAR(50) DEFAULT 'pending_verification', -- pending_verification, active, restricted, disabled
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create payouts table for tracking payout history
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  stripe_transfer_id VARCHAR(255),
  stripe_payout_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  method VARCHAR(20) DEFAULT 'bank_transfer', -- bank_transfer, crypto (future)
  processed_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  INDEX idx_user_payouts (user_id, created_at DESC),
  INDEX idx_status (status)
);

-- Create pool_stats table for tracking pool performance
CREATE TABLE IF NOT EXISTS pool_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id VARCHAR(255) NOT NULL UNIQUE,
  pool_name VARCHAR(255),
  total_devices INTEGER DEFAULT 0,
  active_devices INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  average_task_time INTEGER, -- seconds
  success_rate DECIMAL(5, 2) DEFAULT 100, -- percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create device_sessions table for tracking device contributions
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pool_id VARCHAR(255),
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  tasks_completed INTEGER DEFAULT 0,
  earnings DECIMAL(10, 4) DEFAULT 0,
  cpu_contribution INTEGER, -- percentage of time CPU was used
  bandwidth_used BIGINT, -- bytes
  device_info JSONB,
  INDEX idx_device_sessions (device_id, session_start DESC),
  INDEX idx_user_sessions (user_id, session_start DESC)
);

-- Create waitlist table for platform interest
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  platform VARCHAR(20), -- ios, android, web
  country VARCHAR(2),
  ip_address INET,
  referral_source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, platform)
);

-- Create RLS policies for user_balances
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own balance" ON user_balances
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can update balances" ON user_balances
  FOR ALL
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Create RLS policies for task_completions
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON task_completions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policies for stripe_accounts
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Stripe account" ON stripe_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policies for payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payouts" ON payouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policies for device_sessions
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own device sessions" ON device_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_balances_user ON user_balances(user_id);
CREATE INDEX idx_balances_pending ON user_balances(pending_balance) WHERE pending_balance > 0;
CREATE INDEX idx_completions_user_date ON task_completions(user_id, completed_at DESC);
CREATE INDEX idx_payouts_user_date ON payouts(user_id, created_at DESC);
CREATE INDEX idx_stripe_accounts_status ON stripe_accounts(status) WHERE status = 'active';

-- Create update trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON user_balances
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_stripe_accounts_updated_at BEFORE UPDATE ON stripe_accounts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pool_stats_updated_at BEFORE UPDATE ON pool_stats
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to calculate user earnings summary
CREATE OR REPLACE FUNCTION get_user_earnings_summary(p_user_id UUID)
RETURNS TABLE(
  balance DECIMAL,
  pending_balance DECIMAL,
  total_earned DECIMAL,
  total_withdrawn DECIMAL,
  tasks_completed INTEGER,
  can_request_payout BOOLEAN,
  minimum_payout DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ub.balance,
    ub.pending_balance,
    ub.total_earned,
    ub.total_withdrawn,
    ub.tasks_completed,
    ub.pending_balance >= 10.00 AS can_request_payout,
    10.00 AS minimum_payout
  FROM user_balances ub
  WHERE ub.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to process task completion
CREATE OR REPLACE FUNCTION process_task_completion(
  p_user_id UUID,
  p_task_id VARCHAR,
  p_task_type VARCHAR,
  p_reward DECIMAL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  -- Insert task completion
  INSERT INTO task_completions (user_id, task_id, task_type, reward)
  VALUES (p_user_id, p_task_id, p_task_type, p_reward);
  
  -- Update or insert user balance
  INSERT INTO user_balances (user_id, balance, pending_balance, total_earned, tasks_completed)
  VALUES (p_user_id, p_reward, p_reward, p_reward, 1)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    balance = user_balances.balance + p_reward,
    pending_balance = user_balances.pending_balance + p_reward,
    total_earned = user_balances.total_earned + p_reward,
    tasks_completed = user_balances.tasks_completed + 1,
    updated_at = NOW();
  
  v_success := TRUE;
  RETURN v_success;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE user_balances IS 'Tracks user earnings and payout balances';
COMMENT ON TABLE task_completions IS 'Records all completed compute tasks';
COMMENT ON TABLE stripe_accounts IS 'Stripe Connect account information for payouts';
COMMENT ON TABLE payouts IS 'Payout history and transaction records';
COMMENT ON TABLE pool_stats IS 'Performance metrics for compute pools';
COMMENT ON TABLE device_sessions IS 'Device contribution tracking';
COMMENT ON TABLE waitlist IS 'Platform launch waitlist';

COMMENT ON COLUMN user_balances.pending_balance IS 'Amount available for payout';
COMMENT ON COLUMN task_completions.validation_status IS 'Consensus validation status';
COMMENT ON COLUMN stripe_accounts.status IS 'Stripe account verification status';
COMMENT ON COLUMN payouts.method IS 'Payout method (bank_transfer or crypto)';