export default function ApiPage() {
  return (
    <div style={{ 
      fontFamily: 'system-ui', 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto' 
    }}>
      <h1>CloudHub API</h1>
      <p>API server for the CloudReno platform</p>
      
      <h2>Available Endpoints:</h2>
      <ul>
        <li><code>GET /api/health</code> - Health check</li>
        <li><code>POST /api/intake/web</code> - Website lead intake</li>
        <li><code>GET /api/routing/preview</code> - City to location mapping preview</li>
        <li><code>POST /api/stripe/webhook</code> - Stripe webhooks</li>
      </ul>
      
      <p>
        <strong>Status:</strong> Running in development mode<br />
        <strong>Port:</strong> 3002<br />
        <strong>Version:</strong> 0.1.0
      </p>
    </div>
  );
}