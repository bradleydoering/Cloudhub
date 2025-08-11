-- CloudHub Database Schema
-- Initial migration with core tables and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (franchise branches)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  business_legal_name VARCHAR(255),
  support_email VARCHAR(255),
  support_phone VARCHAR(50),
  billing_address JSONB,
  tax_ids JSONB,
  working_hours JSONB,
  branding_options JSONB,
  routing_rules JSONB, -- { cities: [], postal_patterns: [] }
  default_deal_stages JSONB,
  notification_rules JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Location Settings table
CREATE TABLE location_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, key)
);

-- Users table (staff members)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Memberships (location access and roles)
CREATE TABLE user_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'admin', 'owner', 'sales', 'pm', 'assistant'
  permissions JSONB DEFAULT '{}', -- Additional permissions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, location_id)
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255),
  phone VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  preferred_name VARCHAR(100),
  household_id UUID, -- Self-referencing for household grouping
  profile JSONB DEFAULT '{}', -- Additional customer data
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add household_id foreign key
ALTER TABLE customers ADD CONSTRAINT fk_customers_household 
  FOREIGN KEY (household_id) REFERENCES customers(id) ON DELETE SET NULL;

-- Addresses table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  street_address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'Canada',
  address_type VARCHAR(50) DEFAULT 'service', -- 'service', 'billing', 'mailing'
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals table (pipeline objects)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  service_address_id UUID REFERENCES addresses(id),
  deal_stage VARCHAR(100) NOT NULL DEFAULT 'new',
  budget_range_min INTEGER,
  budget_range_max INTEGER,
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  expected_close_date DATE,
  actual_close_date DATE,
  source VARCHAR(100), -- 'website', 'design-library', 'referral', etc.
  owner_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'won', 'lost', 'archived'
  won_reason TEXT,
  lost_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deal Participants (customers associated with deals)
CREATE TABLE deal_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'primary', -- 'primary', 'secondary', 'decision_maker'
  is_primary BOOLEAN DEFAULT false,
  notify_emails BOOLEAN DEFAULT true,
  notify_sms BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deal_id, customer_id)
);

-- Projects table (converted from won deals)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  project_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  service_address_id UUID REFERENCES addresses(id),
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'on_hold', 'completed', 'cancelled'
  percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  contract_amount INTEGER, -- in cents
  total_budget INTEGER, -- in cents
  manager_id UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  document_type VARCHAR(100), -- 'contract', 'quote', 'design', 'invoice', 'receipt', 'other'
  version INTEGER DEFAULT 1,
  is_customer_visible BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (deal_id IS NOT NULL OR project_id IS NOT NULL)
);

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  title VARCHAR(255),
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  file_size INTEGER,
  photo_type VARCHAR(100) DEFAULT 'progress', -- 'before', 'during', 'after', 'progress'
  phase VARCHAR(100), -- 'demo', 'rough_in', 'finishes', 'completion'
  is_customer_visible BOOLEAN DEFAULT true,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}', -- EXIF data, GPS, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Change Orders table
CREATE TABLE change_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  change_order_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL, -- in cents (can be negative)
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
  customer_approved_at TIMESTAMP WITH TIME ZONE,
  customer_approved_by UUID REFERENCES customers(id),
  internal_approved_at TIMESTAMP WITH TIME ZONE,
  internal_approved_by UUID REFERENCES users(id),
  requested_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, change_order_number)
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  change_order_id UUID REFERENCES change_orders(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  invoice_number VARCHAR(50) NOT NULL,
  stripe_invoice_id VARCHAR(255),
  amount INTEGER NOT NULL, -- in cents
  tax_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'CAD',
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'cancelled'
  due_date DATE,
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(location_id, invoice_number)
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'CAD',
  status VARCHAR(50) NOT NULL, -- 'pending', 'succeeded', 'failed', 'cancelled'
  payment_method VARCHAR(100), -- 'card', 'bank_transfer', 'check', etc.
  transaction_fee INTEGER DEFAULT 0,
  net_amount INTEGER,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table (timeline events)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  activity_type VARCHAR(100) NOT NULL, -- 'status_change', 'document_added', 'note_added', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(50) DEFAULT 'user', -- 'user', 'system', 'webhook'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (deal_id IS NOT NULL OR project_id IS NOT NULL)
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  customer_id UUID REFERENCES customers(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  content TEXT NOT NULL,
  note_type VARCHAR(100) DEFAULT 'general', -- 'general', 'internal', 'customer_facing'
  is_pinned BOOLEAN DEFAULT false,
  author_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id),
  project_id UUID REFERENCES projects(id),
  location_id UUID NOT NULL REFERENCES locations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  operation VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB,
  actor_id UUID REFERENCES users(id),
  actor_type VARCHAR(50) DEFAULT 'user', -- 'user', 'system', 'api'
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(255),
  location_id UUID REFERENCES locations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks table (for event delivery)
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES locations(id),
  event_type VARCHAR(100) NOT NULL,
  endpoint_url TEXT NOT NULL,
  secret VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_failure_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Events table (event queue)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'delivered', 'failed'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_locations_org_id ON locations(organization_id);
CREATE INDEX idx_locations_slug ON locations(slug);
CREATE INDEX idx_user_memberships_user ON user_memberships(user_id);
CREATE INDEX idx_user_memberships_location ON user_memberships(location_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_deals_location ON deals(location_id);
CREATE INDEX idx_deals_owner ON deals(owner_id);
CREATE INDEX idx_deals_stage ON deals(deal_stage);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deal_participants_deal ON deal_participants(deal_id);
CREATE INDEX idx_deal_participants_customer ON deal_participants(customer_id);
CREATE INDEX idx_projects_location ON projects(location_id);
CREATE INDEX idx_projects_deal ON projects(deal_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_documents_deal ON documents(deal_id);
CREATE INDEX idx_documents_project ON documents(project_id);
CREATE INDEX idx_documents_location ON documents(location_id);
CREATE INDEX idx_photos_project ON photos(project_id);
CREATE INDEX idx_photos_location ON photos(location_id);
CREATE INDEX idx_activities_deal ON activities(deal_id);
CREATE INDEX idx_activities_project ON activities(project_id);
CREATE INDEX idx_activities_location ON activities(location_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_location ON audit_logs(location_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_location_settings_updated_at BEFORE UPDATE ON location_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_memberships_updated_at BEFORE UPDATE ON user_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_change_orders_updated_at BEFORE UPDATE ON change_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_events_updated_at BEFORE UPDATE ON webhook_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();