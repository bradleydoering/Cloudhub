// Basic middleware utilities for CloudHub API

interface RequestWithContext extends Request {
  requestId?: string;
  startTime?: number;
}

// Generate unique request ID for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Basic rate limiting (in-memory store for development)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string, 
  limit: number = 60, 
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: limit - 1, resetTime };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}

// Clean up expired rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

// Idempotency key storage (in-memory for development)
const idempotencyStore = new Map<string, { response: any; timestamp: number }>();

export function checkIdempotency(key: string): any | null {
  const record = idempotencyStore.get(key);
  if (!record) return null;
  
  // Expire after 24 hours
  if (Date.now() - record.timestamp > 24 * 60 * 60 * 1000) {
    idempotencyStore.delete(key);
    return null;
  }
  
  return record.response;
}

export function storeIdempotentResponse(key: string, response: any): void {
  idempotencyStore.set(key, {
    response,
    timestamp: Date.now()
  });
}

// Basic structured logging
export function logRequest(params: {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  userId?: string;
  locationId?: string;
  duration?: number;
  status?: number;
  error?: string;
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: params.error ? 'error' : 'info',
    type: 'api_request',
    ...params
  };
  
  console.log(JSON.stringify(logEntry));
}

// Environment checker
export function checkRequiredEnvVars(): void {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // In development, allow placeholder values
  if (process.env.NODE_ENV === 'development') {
    const placeholders = required.filter(key => 
      process.env[key] && process.env[key]!.includes('your-')
    );
    
    if (placeholders.length > 0) {
      console.warn(`⚠️  Development mode: Using placeholder values for: ${placeholders.join(', ')}`);
    }
  }
}

// Basic virus scan stub
export async function scanFile(fileBuffer: Buffer, fileName: string): Promise<{ clean: boolean; threats?: string[] }> {
  // TODO: Integrate with ClamAV or cloud-based virus scanning service
  
  // Basic file type validation
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // Mock scan - in real implementation, this would call ClamAV or similar
  console.log(`[VIRUS_SCAN] Scanning file: ${fileName} (${fileBuffer.length} bytes)`);
  
  // Simulate scan delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // TODO: Replace with actual virus scanning logic
  const isClean = true; // For now, all files are considered clean
  
  return { clean: isClean };
}