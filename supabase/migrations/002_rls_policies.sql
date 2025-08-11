-- Row Level Security Policies for CloudHub
-- Staff: can access rows where location_id ∈ their memberships; Admin bypasses location filter
-- Customers: only their own Deals/Projects via DealParticipants; Documents/Photos require customer_visible=true

-- Enable RLS on all relevant tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_memberships um
    WHERE um.user_id = auth.uid()
    AND um.role = 'admin'
    AND um.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's accessible location IDs
CREATE OR REPLACE FUNCTION get_user_location_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT um.location_id 
    FROM user_memberships um
    WHERE um.user_id = auth.uid()
    AND um.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can access a location
CREATE OR REPLACE FUNCTION can_access_location(location_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admin can access all locations
  IF is_admin() THEN
    RETURN true;
  END IF;
  
  -- Check if user has membership for this location
  RETURN EXISTS (
    SELECT 1 FROM user_memberships um
    WHERE um.user_id = auth.uid()
    AND um.location_id = $1
    AND um.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if customer can access a deal/project
CREATE OR REPLACE FUNCTION customer_can_access_deal(deal_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM deal_participants dp
    JOIN customers c ON c.id = dp.customer_id
    WHERE dp.deal_id = $1
    AND c.id = auth.uid()::UUID -- Assuming customer auth uses customer.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION customer_can_access_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM projects p
    JOIN deal_participants dp ON dp.deal_id = p.deal_id
    JOIN customers c ON c.id = dp.customer_id
    WHERE p.id = $1
    AND c.id = auth.uid()::UUID -- Assuming customer auth uses customer.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies (admin only)
CREATE POLICY "Admins can manage organizations" ON organizations
  FOR ALL USING (is_admin());

-- Locations policies
CREATE POLICY "Staff can view their locations" ON locations
  FOR SELECT USING (can_access_location(id));

CREATE POLICY "Admins can manage locations" ON locations
  FOR ALL USING (is_admin());

-- Location Settings policies
CREATE POLICY "Staff can view location settings" ON location_settings
  FOR SELECT USING (can_access_location(location_id));

CREATE POLICY "Admins can manage location settings" ON location_settings
  FOR ALL USING (is_admin());

-- Users policies
CREATE POLICY "Users can view themselves" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Staff can view users in their locations" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_memberships um1
      JOIN user_memberships um2 ON um1.location_id = um2.location_id
      WHERE um1.user_id = auth.uid()
      AND um2.user_id = users.id
      AND um1.is_active = true
      AND um2.is_active = true
    )
  );

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (is_admin());

-- User Memberships policies
CREATE POLICY "Users can view their memberships" ON user_memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view memberships in their locations" ON user_memberships
  FOR SELECT USING (can_access_location(location_id));

CREATE POLICY "Admins can manage memberships" ON user_memberships
  FOR ALL USING (is_admin());

-- Customers policies
CREATE POLICY "Customers can view themselves" ON customers
  FOR SELECT USING (id = auth.uid()::UUID);

CREATE POLICY "Staff can manage customers in their locations" ON customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN deal_participants dp ON dp.deal_id = d.id
      WHERE dp.customer_id = customers.id
      AND can_access_location(d.location_id)
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      JOIN deal_participants dp ON dp.deal_id = p.deal_id
      WHERE dp.customer_id = customers.id
      AND can_access_location(p.location_id)
    )
  );

-- Addresses policies (inherit from deals/projects)
CREATE POLICY "Staff can manage addresses" ON addresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.service_address_id = addresses.id
      AND can_access_location(d.location_id)
    )
    OR
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.service_address_id = addresses.id
      AND can_access_location(p.location_id)
    )
  );

-- Deals policies
CREATE POLICY "Staff can manage deals in their locations" ON deals
  FOR ALL USING (can_access_location(location_id));

CREATE POLICY "Customers can view their deals" ON deals
  FOR SELECT USING (customer_can_access_deal(id));

-- Deal Participants policies
CREATE POLICY "Staff can manage deal participants" ON deal_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_participants.deal_id
      AND can_access_location(d.location_id)
    )
  );

CREATE POLICY "Customers can view their participation" ON deal_participants
  FOR SELECT USING (customer_id = auth.uid()::UUID);

-- Projects policies
CREATE POLICY "Staff can manage projects in their locations" ON projects
  FOR ALL USING (can_access_location(location_id));

CREATE POLICY "Customers can view their projects" ON projects
  FOR SELECT USING (customer_can_access_project(id));

-- Documents policies
CREATE POLICY "Staff can manage documents" ON documents
  FOR ALL USING (
    (deal_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = documents.deal_id
      AND can_access_location(d.location_id)
    ))
    OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = documents.project_id
      AND can_access_location(p.location_id)
    ))
  );

CREATE POLICY "Customers can view visible documents" ON documents
  FOR SELECT USING (
    is_customer_visible = true
    AND (
      (deal_id IS NOT NULL AND customer_can_access_deal(deal_id))
      OR
      (project_id IS NOT NULL AND customer_can_access_project(project_id))
    )
  );

-- Photos policies
CREATE POLICY "Staff can manage photos" ON photos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = photos.project_id
      AND can_access_location(p.location_id)
    )
  );

CREATE POLICY "Customers can view visible photos" ON photos
  FOR SELECT USING (
    is_customer_visible = true
    AND customer_can_access_project(project_id)
  );

-- Change Orders policies
CREATE POLICY "Staff can manage change orders" ON change_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = change_orders.project_id
      AND can_access_location(p.location_id)
    )
  );

CREATE POLICY "Customers can view their change orders" ON change_orders
  FOR SELECT USING (customer_can_access_project(project_id));

CREATE POLICY "Customers can approve change orders" ON change_orders
  FOR UPDATE USING (
    customer_can_access_project(project_id)
    AND status = 'pending'
  );

-- Invoices policies
CREATE POLICY "Staff can manage invoices" ON invoices
  FOR ALL USING (can_access_location(location_id));

CREATE POLICY "Customers can view their invoices" ON invoices
  FOR SELECT USING (
    (project_id IS NOT NULL AND customer_can_access_project(project_id))
  );

-- Payments policies
CREATE POLICY "Staff can view payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = payments.invoice_id
      AND can_access_location(i.location_id)
    )
  );

CREATE POLICY "Customers can view their payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = payments.invoice_id
      AND i.project_id IS NOT NULL
      AND customer_can_access_project(i.project_id)
    )
  );

-- Activities policies
CREATE POLICY "Staff can manage activities" ON activities
  FOR ALL USING (can_access_location(location_id));

CREATE POLICY "Customers can view their activities" ON activities
  FOR SELECT USING (
    (deal_id IS NOT NULL AND customer_can_access_deal(deal_id))
    OR
    (project_id IS NOT NULL AND customer_can_access_project(project_id))
  );

-- Notes policies
CREATE POLICY "Staff can manage notes" ON notes
  FOR ALL USING (can_access_location(location_id));

-- Tasks policies
CREATE POLICY "Staff can manage tasks" ON tasks
  FOR ALL USING (can_access_location(location_id));

-- Audit Logs policies (staff only)
CREATE POLICY "Staff can view audit logs" ON audit_logs
  FOR SELECT USING (
    location_id IS NULL OR can_access_location(location_id)
  );

-- Webhooks policies (admin only)
CREATE POLICY "Admins can manage webhooks" ON webhooks
  FOR ALL USING (is_admin());

-- Webhook Events policies (admin only)
CREATE POLICY "Admins can manage webhook events" ON webhook_events
  FOR ALL USING (is_admin());