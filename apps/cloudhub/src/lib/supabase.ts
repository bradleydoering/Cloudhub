import { 
  Customer, 
  Project, 
  ProjectWithCustomer, 
  Deal, 
  Document, 
  Invoice, 
  InvoiceItem, 
  InvoiceWithItems, 
  ChangeOrder, 
  Photo, 
  ProjectActivity,
  ProjectDetails
} from '../types/database';

// In-memory mock data that persists during session
let mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Kitchen Renovation - Doe Residence',
    customer_id: '1',
    customer_name: 'John & Jane Doe',
    value: 35000,
    stage: 'new',
    priority: 'high',
    expected_close_date: '2025-09-15',
    source: 'website',
    notes: 'Initial consultation completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Master Suite Addition',
    customer_id: '2', 
    customer_name: 'Alice Wong',
    value: 75000,
    stage: 'qualified',
    priority: 'urgent',
    expected_close_date: '2025-08-20',
    source: 'referral',
    notes: 'High priority client',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Bathroom Remodel - Smith Home',
    customer_id: '3',
    customer_name: 'Bob Smith', 
    value: 18000,
    stage: 'estimating',
    priority: 'medium',
    expected_close_date: '2025-10-01',
    source: 'design-library',
    notes: 'Waiting for material selection',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let mockProjects: ProjectWithCustomer[] = [
  {
    id: '1',
    title: 'Kitchen Renovation - Doe Residence',
    customer_id: '1',
    status: 'in-progress',
    percent_complete: 45,
    contract_amount: 35000,
    start_date: '2024-12-01',
    expected_completion: '2025-03-15',
    created_at: new Date().toISOString(),
    customer: { id: '1', name: 'John & Jane Doe', email: 'doe@example.com', phone: '555-0101' }
  }
];

let mockCustomers: Customer[] = [
  { id: '1', name: 'John & Jane Doe', email: 'doe@example.com', phone: '555-0101', status: 'active', created_at: new Date().toISOString() },
  { id: '2', name: 'Alice Wong', email: 'alice@example.com', phone: '555-0102', status: 'active', created_at: new Date().toISOString() },
  { id: '3', name: 'Bob Smith', email: 'bob@example.com', phone: '555-0103', status: 'active', created_at: new Date().toISOString() }
];

// Working mock implementation with in-memory persistence
class SupabaseService {
  // Projects
  async getProjects(locationFilter?: string): Promise<ProjectWithCustomer[]> {
    try {
      // Filter by location if specified
      let filteredProjects = [...mockProjects];
      if (locationFilter && locationFilter !== 'all') {
        // For mock data, we'll assume all projects are in Vancouver for simplicity
        // In real implementation, this would filter by customer location
      }
      return filteredProjects.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
    try {
      const [project, documents, photos, changeOrders, invoices, activities] = await Promise.all([
        this.getProjectById(projectId),
        this.getProjectDocuments(projectId),
        this.getProjectPhotos(projectId),
        this.getProjectChangeOrders(projectId),
        this.getProjectInvoices(projectId),
        this.getProjectActivities(projectId)
      ]);

      if (!project) return null;

      return {
        project,
        documents,
        photos,
        changeOrders,
        invoices,
        activities
      };
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  }

  async getProjectById(projectId: string): Promise<ProjectWithCustomer | null> {
    try {
      const result = await this.executeQuery(`
        SELECT 
          p.*,
          c.*
        FROM projects p
        JOIN customers c ON p.customer_id = c.id
        WHERE p.id = $1
      `, [projectId]);

      if (result.length === 0) return null;

      const row = result[0];
      return {
        ...row,
        customer: {
          id: row.customer_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          address_line1: row.address_line1,
          city: row.city,
          province: row.province
        }
      };
    } catch (error) {
      console.error('Error fetching project by ID:', error);
      throw error;
    }
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    try {
      const result = await this.executeQuery(`
        INSERT INTO projects (
          project_number, title, description, customer_id,
          status, priority, contract_amount, start_date, expected_completion,
          manager, project_type, address_line1, city, province, postal_code, country
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *
      `, [
        projectData.project_number,
        projectData.title,
        projectData.description,
        projectData.customer_id,
        projectData.status || 'not-started',
        projectData.priority || 'medium',
        projectData.contract_amount,
        projectData.start_date,
        projectData.expected_completion,
        projectData.manager,
        projectData.project_type,
        projectData.address_line1,
        projectData.city,
        projectData.province,
        projectData.postal_code,
        projectData.country
      ]);

      return result[0];
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const result = await this.executeQuery(`
        UPDATE projects 
        SET 
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          status = COALESCE($4, status),
          priority = COALESCE($5, priority),
          contract_amount = COALESCE($6, contract_amount),
          percent_complete = COALESCE($7, percent_complete),
          manager = COALESCE($8, manager),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [
        projectId,
        updates.title,
        updates.description,
        updates.status,
        updates.priority,
        updates.contract_amount,
        updates.percent_complete,
        updates.manager
      ]);

      return result[0];
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Deals
  async getDeals(locationFilter?: string): Promise<Deal[]> {
    try {
      // Filter by location if specified
      let filteredDeals = [...mockDeals];
      if (locationFilter && locationFilter !== 'all') {
        // For mock data, we'll assume all deals are in Vancouver for simplicity
        // In real implementation, this would filter by customer location
      }
      return filteredDeals.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  async createDeal(dealData: Partial<Deal>): Promise<Deal> {
    try {
      const newDeal: Deal = {
        id: Date.now().toString(),
        title: dealData.title || '',
        customer_id: dealData.customer_id || null,
        customer_name: dealData.customer_name || '',
        value: dealData.value || 0,
        stage: dealData.stage || 'new',
        priority: dealData.priority || 'medium',
        expected_close_date: dealData.expected_close_date || '',
        source: dealData.source || 'website',
        notes: dealData.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockDeals.unshift(newDeal);
      return newDeal;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  }

  async updateDeal(dealId: string, updates: Partial<Deal>): Promise<Deal> {
    try {
      const dealIndex = mockDeals.findIndex(d => d.id === dealId);
      if (dealIndex === -1) throw new Error('Deal not found');
      
      mockDeals[dealIndex] = {
        ...mockDeals[dealIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      return mockDeals[dealIndex];
    } catch (error) {
      console.error('Error updating deal:', error);
      throw error;
    }
  }

  async deleteDeal(dealId: string): Promise<void> {
    try {
      const dealIndex = mockDeals.findIndex(d => d.id === dealId);
      if (dealIndex === -1) throw new Error('Deal not found');
      
      mockDeals.splice(dealIndex, 1);
    } catch (error) {
      console.error('Error deleting deal:', error);
      throw error;
    }
  }

  // Dashboard Statistics
  async getDashboardStats(locationFilter?: string): Promise<{
    activeDeals: number;
    totalPipelineValue: number;
    activeProjects: number; 
    completedProjects: number;
    revenueThisMonth: number;
  }> {
    try {
      const activeDeals = mockDeals.filter(d => !['closed-won', 'closed-lost'].includes(d.stage));
      const totalPipelineValue = activeDeals.reduce((sum, deal) => sum + deal.value, 0);
      const activeProjects = mockProjects.filter(p => ['in-progress', 'not-started'].includes(p.status || ''));
      const completedProjects = mockProjects.filter(p => p.status === 'completed');
      const revenueThisMonth = completedProjects.reduce((sum, p) => sum + (p.contract_amount || 0), 0);

      return {
        activeDeals: activeDeals.length,
        totalPipelineValue,
        activeProjects: activeProjects.length,
        completedProjects: completedProjects.length,
        revenueThisMonth
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    try {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: customerData.name || '',
        email: customerData.email || '',
        phone: customerData.phone || '',
        status: customerData.status || 'prospect',
        customer_type: customerData.customer_type || 'individual',
        location: customerData.location || 'Vancouver',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockCustomers.push(newCustomer);
      return newCustomer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Project-related queries
  async getProjectDocuments(projectId: string): Promise<Document[]> {
    try {
      return await this.executeQuery(`
        SELECT * FROM documents 
        WHERE project_id = $1 
        ORDER BY created_at DESC
      `, [projectId]);
    } catch (error) {
      console.error('Error fetching project documents:', error);
      throw error;
    }
  }

  async getProjectPhotos(projectId: string): Promise<Photo[]> {
    try {
      return await this.executeQuery(`
        SELECT * FROM photos 
        WHERE project_id = $1 
        ORDER BY display_order ASC, created_at DESC
      `, [projectId]);
    } catch (error) {
      console.error('Error fetching project photos:', error);
      throw error;
    }
  }

  async getProjectChangeOrders(projectId: string): Promise<ChangeOrder[]> {
    try {
      return await this.executeQuery(`
        SELECT * FROM change_orders 
        WHERE project_id = $1 
        ORDER BY created_at DESC
      `, [projectId]);
    } catch (error) {
      console.error('Error fetching change orders:', error);
      throw error;
    }
  }

  async getProjectInvoices(projectId: string): Promise<InvoiceWithItems[]> {
    try {
      const invoices = await this.executeQuery(`
        SELECT * FROM invoices 
        WHERE project_id = $1 
        ORDER BY created_at DESC
      `, [projectId]);

      const invoicesWithItems = await Promise.all(
        invoices.map(async (invoice: Invoice) => {
          const items = await this.executeQuery(`
            SELECT * FROM invoice_items 
            WHERE invoice_id = $1 
            ORDER BY line_order ASC
          `, [invoice.id]);

          return {
            ...invoice,
            items
          };
        })
      );

      return invoicesWithItems;
    } catch (error) {
      console.error('Error fetching project invoices:', error);
      throw error;
    }
  }

  async getProjectActivities(projectId: string): Promise<ProjectActivity[]> {
    try {
      return await this.executeQuery(`
        SELECT * FROM project_activities 
        WHERE project_id = $1 
        ORDER BY created_at DESC
      `, [projectId]);
    } catch (error) {
      console.error('Error fetching project activities:', error);
      throw error;
    }
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    try {
      return await this.executeQuery(`
        SELECT * FROM customers 
        ORDER BY name ASC
      `);
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Helper method to execute queries
  private async executeQuery(sql: string, params?: any[]): Promise<any[]> {
    // This is a mock implementation
    // In real implementation, this would use the MCP Supabase client
    console.log('Executing query:', sql, params);
    
    // For now, return empty array - this will be replaced with actual MCP calls
    return [];
  }
}

export const supabaseService = new SupabaseService();