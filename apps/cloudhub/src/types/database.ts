export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  customer_type: 'individual' | 'business';
  status: 'active' | 'inactive' | 'prospect';
  business_name?: string;
  business_number?: string;
  notes?: string;
  referral_source?: string;
  preferred_contact_method?: 'email' | 'phone' | 'text';
}

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  project_number: string;
  title: string;
  description?: string;
  customer_id: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  status: 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  percent_complete: number;
  contract_amount: number;
  start_date: string;
  expected_completion: string;
  actual_completion?: string;
  manager: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_type?: string;
}

export interface Deal {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  customer_id: string;
  customer_name: string;
  value: number;
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  probability: number;
  expected_close_date?: string;
  actual_close_date?: string;
  source?: string;
  assigned_to?: string;
  notes?: string;
  last_activity?: string;
  next_follow_up?: string;
  converted_to_project_id?: string;
}

export interface Document {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  original_name?: string;
  file_path?: string;
  file_url?: string;
  file_size?: number;
  size: number;
  mime_type?: string;
  type: string;
  project_id?: string;
  customer_id?: string;
  document_type?: string;
  category: 'contract' | 'permit' | 'plan' | 'specification' | 'correspondence' | 'other';
  description?: string;
  uploaded_by: string;
  upload_date: string;
  is_public?: boolean;
  shared_with?: string[];
}

export interface Invoice {
  id: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
  customer_id: string;
  invoice_number: string;
  number: string;
  description?: string;
  total_amount: number;
  amount: number;
  tax_amount?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  issueDate: string;
  due_date: string;
  dueDate: string;
  paid_date?: string;
  payment_terms?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  created_at: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  line_order: number;
}

export interface ChangeOrder {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  project_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  submit_date?: string;
  submitted_date: string;
  review_date?: string;
  approval_date?: string;
  implementation_date?: string;
  submitted_by: string;
  reviewed_by?: string;
  approved_by?: string;
  reason?: string;
  impact_on_schedule?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Photo {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  original_name?: string;
  file_path?: string;
  url: string;
  file_size?: number;
  project_id: string;
  category: 'before' | 'progress' | 'after' | 'other';
  description?: string;
  width?: number;
  height?: number;
  uploaded_by: string;
  uploadedBy: string;
  taken_date?: string;
  uploadDate: string;
  display_order?: number;
  is_featured?: boolean;
}

export interface ProjectActivity {
  id: string;
  created_at: string;
  project_id: string;
  activity_type: 'milestone' | 'progress' | 'note' | 'issue' | 'change_order' | 'payment';
  title: string;
  description?: string;
  performed_by: string;
  metadata?: Record<string, any>;
}

// Combined types for UI components
export interface ProjectWithCustomer extends Project {
  customer: Customer;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

export interface ProjectDetails {
  project: ProjectWithCustomer;
  documents: Document[];
  photos: Photo[];
  changeOrders: ChangeOrder[];
  invoices: InvoiceWithItems[];
  activities: ProjectActivity[];
}