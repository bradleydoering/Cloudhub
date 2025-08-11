import { checkRequiredEnvVars } from '../../lib/middleware';

export async function GET() {
  try {
    // Check environment variables on health check
    checkRequiredEnvVars();
    
    return Response.json({ 
      ok: true, 
      time: new Date().toISOString(),
      service: 'cloudhub-api',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return Response.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Configuration error'
      },
      { status: 503 }
    );
  }
}