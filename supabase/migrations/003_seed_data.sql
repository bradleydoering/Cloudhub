-- Seed data for CloudHub
-- Create CloudReno organization and two locations with basic routing rules

-- Insert CloudReno organization
INSERT INTO organizations (id, name, slug) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'CloudReno Franchise', 'cloudreno');

-- Insert two locations
INSERT INTO locations (
  id, 
  organization_id, 
  name, 
  slug, 
  display_name, 
  business_legal_name,
  support_email, 
  support_phone,
  billing_address,
  routing_rules
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'CloudReno North Vancouver',
  'north-vancouver',
  'CloudReno North Vancouver',
  'CloudReno North Vancouver Ltd.',
  'northvan@cloudrenovation.ca',
  '+1 (604) 123-4567',
  '{
    "street": "123 Marine Drive",
    "city": "North Vancouver",
    "province": "BC",
    "postal_code": "V7M 1A1",
    "country": "Canada"
  }',
  '{
    "cities": [
      "North Vancouver", 
      "West Vancouver", 
      "Deep Cove",
      "Lynn Valley",
      "Capilano"
    ],
    "postal_patterns": [
      "^V7[ABCDGHJKLMNPQRSTUVWXYZ].*"
    ]
  }'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  'CloudReno Vancouver',
  'vancouver',
  'CloudReno Vancouver',
  'CloudReno Vancouver Ltd.',
  'vancouver@cloudrenovation.ca',
  '+1 (604) 987-6543',
  '{
    "street": "456 Granville Street",
    "city": "Vancouver",
    "province": "BC", 
    "postal_code": "V6B 2R7",
    "country": "Canada"
  }',
  '{
    "cities": [
      "Vancouver",
      "Burnaby",
      "Richmond",
      "New Westminster",
      "Surrey",
      "Delta",
      "Coquitlam",
      "Port Coquitlam",
      "Langley"
    ],
    "postal_patterns": [
      "^V5[ABCEGHHJKLMNPQRSTUVWXYZ].*",
      "^V6[ABCEGHHJKLMNPQRSTUVWXYZ].*",
      "^V3[ABCEGHHJKLMNPQRSTUVWXYZ].*"
    ]
  }'
);

-- Insert default location settings
INSERT INTO location_settings (location_id, key, value) VALUES
-- North Vancouver settings
('550e8400-e29b-41d4-a716-446655440001', 'default_deal_stages', 
 '["New", "Qualified", "Estimating", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"]'),
('550e8400-e29b-41d4-a716-446655440001', 'working_hours', 
 '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "closed", "sunday": "closed"}'),
('550e8400-e29b-41d4-a716-446655440001', 'notification_rules',
 '{"new_lead": true, "deal_stage_change": true, "project_update": true, "invoice_paid": true}'),

-- Vancouver settings  
('550e8400-e29b-41d4-a716-446655440002', 'default_deal_stages', 
 '["New", "Qualified", "Estimating", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"]'),
('550e8400-e29b-41d4-a716-446655440002', 'working_hours', 
 '{"monday": "8:00-18:00", "tuesday": "8:00-18:00", "wednesday": "8:00-18:00", "thursday": "8:00-18:00", "friday": "8:00-18:00", "saturday": "9:00-15:00", "sunday": "closed"}'),
('550e8400-e29b-41d4-a716-446655440002', 'notification_rules',
 '{"new_lead": true, "deal_stage_change": true, "project_update": true, "invoice_paid": true}');

-- Insert demo users
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  phone,
  is_active
) VALUES
-- Admin user
('550e8400-e29b-41d4-a716-446655440100', 'admin@cloudrenovation.ca', 'Brad', 'Admin', '+1 (604) 555-0001', true),
-- North Vancouver team
('550e8400-e29b-41d4-a716-446655440101', 'manager.nv@cloudrenovation.ca', 'Sarah', 'Johnson', '+1 (604) 555-0002', true),
('550e8400-e29b-41d4-a716-446655440102', 'sales.nv@cloudrenovation.ca', 'Mike', 'Chen', '+1 (604) 555-0003', true),
-- Vancouver team
('550e8400-e29b-41d4-a716-446655440103', 'manager.van@cloudrenovation.ca', 'Emily', 'Rodriguez', '+1 (604) 555-0004', true),
('550e8400-e29b-41d4-a716-446655440104', 'sales.van@cloudrenovation.ca', 'David', 'Kim', '+1 (604) 555-0005', true),
('550e8400-e29b-41d4-a716-446655440105', 'pm.van@cloudrenovation.ca', 'Jessica', 'Thompson', '+1 (604) 555-0006', true);

-- Insert user memberships
INSERT INTO user_memberships (user_id, location_id, role, is_active) VALUES
-- Admin has access to all locations
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'admin', true),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440002', 'admin', true),

-- North Vancouver team
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'owner', true),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'sales', true),

-- Vancouver team
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440002', 'owner', true),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440002', 'sales', true),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440002', 'pm', true);

-- Insert demo customers
INSERT INTO customers (
  id,
  email,
  phone,
  first_name,
  last_name,
  is_active
) VALUES
('550e8400-e29b-41d4-a716-446655440200', 'john.doe@email.com', '+1 (604) 555-1001', 'John', 'Doe', true),
('550e8400-e29b-41d4-a716-446655440201', 'jane.doe@email.com', '+1 (604) 555-1002', 'Jane', 'Doe', true),
('550e8400-e29b-41d4-a716-446655440202', 'bob.smith@email.com', '+1 (604) 555-1003', 'Bob', 'Smith', true),
('550e8400-e29b-41d4-a716-446655440203', 'alice.wong@email.com', '+1 (604) 555-1004', 'Alice', 'Wong', true);

-- Set Jane as John's household member (spouse)
UPDATE customers SET household_id = '550e8400-e29b-41d4-a716-446655440200' 
WHERE id = '550e8400-e29b-41d4-a716-446655440201';

-- Insert demo addresses
INSERT INTO addresses (
  id,
  street_address,
  city,
  province,
  postal_code,
  address_type
) VALUES
('550e8400-e29b-41d4-a716-446655440300', '123 Maple Street', 'North Vancouver', 'BC', 'V7M 2A1', 'service'),
('550e8400-e29b-41d4-a716-446655440301', '456 Oak Avenue', 'Vancouver', 'BC', 'V6B 3C2', 'service'),
('550e8400-e29b-41d4-a716-446655440302', '789 Pine Road', 'Burnaby', 'BC', 'V5A 4D3', 'service');

-- Insert demo deals
INSERT INTO deals (
  id,
  location_id,
  title,
  description,
  service_address_id,
  deal_stage,
  budget_range_min,
  budget_range_max,
  priority,
  expected_close_date,
  source,
  owner_id,
  status
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440400',
  '550e8400-e29b-41d4-a716-446655440001', -- North Vancouver
  'Kitchen Renovation - Doe Residence',
  'Complete kitchen renovation including new cabinets, countertops, appliances, and flooring.',
  '550e8400-e29b-41d4-a716-446655440300',
  'Proposal Sent',
  25000,
  35000,
  'high',
  '2025-09-15',
  'website',
  '550e8400-e29b-41d4-a716-446655440102', -- Mike Chen (sales)
  'active'
),
(
  '550e8400-e29b-41d4-a716-446655440401',
  '550e8400-e29b-41d4-a716-446655440002', -- Vancouver
  'Bathroom Remodel - Smith Home',
  'Master bathroom renovation with walk-in shower and double vanity.',
  '550e8400-e29b-41d4-a716-446655440301',
  'Estimating',
  15000,
  20000,
  'medium',
  '2025-10-01',
  'design-library',
  '550e8400-e29b-41d4-a716-446655440104', -- David Kim (sales)
  'active'
);

-- Insert deal participants
INSERT INTO deal_participants (deal_id, customer_id, role, is_primary, notify_emails) VALUES
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440200', 'primary', true, true), -- John Doe
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440201', 'secondary', false, true), -- Jane Doe
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440202', 'primary', true, true); -- Bob Smith

-- Insert sample activities
INSERT INTO activities (
  deal_id,
  location_id,
  activity_type,
  title,
  description,
  actor_id,
  actor_type
) VALUES
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440001', 'stage_change', 'Deal moved to Proposal Sent', 'Proposal was sent to customer via email', '550e8400-e29b-41d4-a716-446655440102', 'user'),
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440002', 'note_added', 'Customer consultation completed', 'Initial consultation completed. Customer prefers modern style with natural materials.', '550e8400-e29b-41d4-a716-446655440104', 'user');

-- Insert sample notes
INSERT INTO notes (
  deal_id,
  location_id,
  content,
  note_type,
  author_id
) VALUES
('550e8400-e29b-41d4-a716-446655440400', '550e8400-e29b-41d4-a716-446655440001', 'Customer is very interested in sustainable materials. Discussed bamboo flooring and recycled glass countertops.', 'general', '550e8400-e29b-41d4-a716-446655440102'),
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440002', 'Need to schedule site visit next week to take measurements.', 'internal', '550e8400-e29b-41d4-a716-446655440104');

-- Comments
COMMENT ON TABLE organizations IS 'Top-level organization (CloudReno Franchise)';
COMMENT ON TABLE locations IS 'Franchise locations/branches with routing rules';
COMMENT ON TABLE deals IS 'Sales pipeline objects that convert to projects when won';
COMMENT ON TABLE projects IS 'Active renovation projects created from won deals';
COMMENT ON COLUMN locations.routing_rules IS 'JSON rules for mapping cities/postal codes to this location';
COMMENT ON COLUMN deals.deal_stage IS 'Current stage in sales pipeline';
COMMENT ON COLUMN projects.percent_complete IS 'Project completion percentage (0-100)';
COMMENT ON COLUMN documents.is_customer_visible IS 'Whether document is visible to customers in portal';
COMMENT ON COLUMN photos.is_customer_visible IS 'Whether photo is visible to customers in portal';