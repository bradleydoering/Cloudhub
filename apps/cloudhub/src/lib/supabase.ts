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

// Mock implementation for now - will be replaced with actual Supabase client
class SupabaseService {
  // Projects
  async getProjects(): Promise<ProjectWithCustomer[]> {
    try {
      // This would normally be a Supabase query
      const projects = await this.executeQuery(`
        SELECT 
          p.*,
          c.name as customer_name,
          c.email as customer_email,
          c.phone as customer_phone
        FROM projects p
        JOIN customers c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
      `);

      return projects.map((p: any) => ({
        ...p,
        customer: {
          id: p.customer_id,
          name: p.customer_name,
          email: p.customer_email,
          phone: p.customer_phone
        }
      }));
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
  async getDeals(): Promise<Deal[]> {
    try {
      return await this.executeQuery(`
        SELECT * FROM deals 
        ORDER BY created_at DESC
      `);
    } catch (error) {
      console.error('Error fetching deals:', error);
      throw error;
    }
  }

  async createDeal(dealData: Partial<Deal>): Promise<Deal> {
    try {
      const result = await this.executeQuery(`
        INSERT INTO deals (
          title, description, customer_id, customer_name, value,
          stage, priority, probability, expected_close_date, source, assigned_to, notes
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *
      `, [
        dealData.title,
        dealData.description,
        dealData.customer_id,
        dealData.customer_name,
        dealData.value,
        dealData.stage || 'new',
        dealData.priority || 'medium',
        dealData.probability || 50,
        dealData.expected_close_date,
        dealData.source,
        dealData.assigned_to,
        dealData.notes
      ]);

      return result[0];
    } catch (error) {
      console.error('Error creating deal:', error);
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