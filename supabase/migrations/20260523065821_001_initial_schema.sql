/*
  # MoChat Initial Schema

  1. Purpose
    This migration creates the complete data model for MoChat, a secure messaging
    application with E2EE support, group management, and AIOps capabilities.

  2. New Tables
    - `users`: Core user accounts with snowflake IDs and E2EE public keys
    - `friendships`: Bidirectional friend relationships with block support
    - `groups`: Group chat containers
    - `group_memberships`: User membership in groups with roles
    - `conversations`: Chat sessions (private & group) with sequence tracking
    - `messages`: E2EE encrypted message storage with ordering
    - `alerts`: AIOps alert management
    - `heal_actions`: Automated remediation action tracking

  3. Security
    - RLS enabled on all tables
    - Users can only access their own data and authorized conversations
    - Group access restricted to members
    - Friend data restricted to participants
*/

-- Users table with snowflake IDs and E2EE public keys
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Friendships table (bidirectional relationships)
CREATE TABLE IF NOT EXISTS friendships (
  uid_1 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uid_2 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'blocked')),
  blocked_by BIGINT CHECK (blocked_by IS NULL OR blocked_by IN (uid_1, uid_2)),
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (uid_1, uid_2),
  CHECK (uid_1 < uid_2) -- Ensure uid_1 < uid_2 for consistency
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_uid BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
  group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'left', 'kicked')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Conversations (private 1:1 and group chats)
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT PRIMARY KEY,
  type SMALLINT NOT NULL CHECK (type IN (0, 1)), -- 0=private, 1=group
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  uid_1 BIGINT REFERENCES users(id) ON DELETE CASCADE,
  uid_2 BIGINT REFERENCES users(id) ON DELETE CASCADE,
  latest_seq BIGINT NOT NULL DEFAULT 0,
  latest_msg_time TIMESTAMPTZ,
  uid_1_seq BIGINT NOT NULL DEFAULT 0, -- Last read seq by uid_1
  uid_2_seq BIGINT NOT NULL DEFAULT 0, -- Last read seq by uid_2
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (type = 0 AND uid_1 IS NOT NULL AND uid_2 IS NOT NULL AND group_id IS NULL) OR
    (type = 1 AND group_id IS NOT NULL AND uid_1 IS NULL AND uid_2 IS NULL)
  )
);

-- Messages with E2EE payloads
CREATE TABLE IF NOT EXISTS messages (
  msg_id BIGINT PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  seq BIGINT NOT NULL,
  sender_uid BIGINT NOT NULL REFERENCES users(id),
  payload_base64 TEXT NOT NULL, -- E2EE ciphertext
  server_ts_ms BIGINT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'system', 'call', 'video')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (conversation_id, seq)
);

-- Alerts for AIOps
CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT PRIMARY KEY DEFAULT gen_random_uuid()::text::bigint,
  alert_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  fingerprint TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('firing', 'resolved')),
  labels JSONB DEFAULT '{}',
  annotations JSONB DEFAULT '{}',
  fired_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Heal actions for AIOps
CREATE TABLE IF NOT EXISTS heal_actions (
  id BIGINT PRIMARY KEY DEFAULT gen_random_uuid()::text::bigint,
  alert_id BIGINT REFERENCES alerts(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'pod_restart', 'hpa_scale_out', 'hpa_scale_in', 
    'node_drain', 'service_restart', 'config_reload'
  )),
  target_resource TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed')),
  result_message TEXT,
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE heal_actions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text::bigint = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text::bigint = id)
  WITH CHECK (auth.uid()::text::bigint = id);

-- Friendships policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (uid_1 = auth.uid()::text::bigint OR uid_2 = auth.uid()::text::bigint);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (uid_1 = auth.uid()::text::bigint OR uid_2 = auth.uid()::text::bigint);

CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  TO authenticated
  USING (uid_1 = auth.uid()::text::bigint OR uid_2 = auth.uid()::text::bigint)
  WITH CHECK (uid_1 = auth.uid()::text::bigint OR uid_2 = auth.uid()::text::bigint);

-- Groups policies
CREATE POLICY "Users can view groups they are members of"
  ON groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_memberships
      WHERE group_memberships.group_id = groups.id
      AND group_memberships.user_id = auth.uid()::text::bigint
    )
  );

CREATE POLICY "Group owners can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (owner_uid = auth.uid()::text::bigint)
  WITH CHECK (owner_uid = auth.uid()::text::bigint);

-- Group memberships policies
CREATE POLICY "Users can view memberships of their groups"
  ON group_memberships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.group_id = group_memberships.group_id
      AND gm.user_id = auth.uid()::text::bigint
    )
  );

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    (type = 0 AND (uid_1 = auth.uid()::text::bigint OR uid_2 = auth.uid()::text::bigint)) OR
    (type = 1 AND EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.group_id = conversations.group_id
      AND gm.user_id = auth.uid()::text::bigint
    ))
  );

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (
    (type = 0 AND (uid_1 = auth.uid()::text::bigint OR uid_2 = auth.uid()::text::bigint)) OR
    (type = 1 AND EXISTS (
      SELECT 1 FROM group_memberships gm
      WHERE gm.group_id = conversations.group_id
      AND gm.user_id = auth.uid()::text::bigint
    ))
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        (c.type = 0 AND (c.uid_1 = auth.uid()::text::bigint OR c.uid_2 = auth.uid()::text::bigint)) OR
        (c.type = 1 AND EXISTS (
          SELECT 1 FROM group_memberships gm
          WHERE gm.group_id = c.group_id
          AND gm.user_id = auth.uid()::text::bigint
        ))
      )
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_uid = auth.uid()::text::bigint AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (
        (c.type = 0 AND (c.uid_1 = auth.uid()::text::bigint OR c.uid_2 = auth.uid()::text::bigint)) OR
        (type = 1 AND EXISTS (
          SELECT 1 FROM group_memberships gm
          WHERE gm.group_id = c.group_id
          AND gm.user_id = auth.uid()::text::bigint
        ))
      )
    )
  );

-- Alerts policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can read alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (true);

-- Heal actions policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can read heal actions"
  ON heal_actions FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_friendships_uid1 ON friendships(uid_1);
CREATE INDEX idx_friendships_uid2 ON friendships(uid_2);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_conversations_uid1 ON conversations(uid_1);
CREATE INDEX idx_conversations_uid2 ON conversations(uid_2);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, seq DESC);
CREATE INDEX idx_messages_sender ON messages(sender_uid);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_heal_actions_alert ON heal_actions(alert_id);