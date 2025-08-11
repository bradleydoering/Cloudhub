export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  
  if (!city) {
    return Response.json(
      { error: 'City parameter is required' },
      { status: 400 }
    );
  }
  
  // Mock routing logic - TODO: Replace with database query
  const mockRoutingRules: Record<string, { location_id: string; location_name: string; confidence: number }> = {
    'North Vancouver': {
      location_id: 'loc_north_vancouver',
      location_name: 'CloudReno North Vancouver',
      confidence: 1.0
    },
    'West Vancouver': {
      location_id: 'loc_north_vancouver', 
      location_name: 'CloudReno North Vancouver',
      confidence: 0.9
    },
    'Vancouver': {
      location_id: 'loc_vancouver',
      location_name: 'CloudReno Vancouver', 
      confidence: 1.0
    },
    'Burnaby': {
      location_id: 'loc_vancouver',
      location_name: 'CloudReno Vancouver',
      confidence: 0.8
    },
    'Richmond': {
      location_id: 'loc_vancouver', 
      location_name: 'CloudReno Vancouver',
      confidence: 0.8
    }
  };
  
  const result = mockRoutingRules[city] || {
    location_id: 'loc_vancouver',
    location_name: 'CloudReno Vancouver (default)',
    confidence: 0.5
  };
  
  return Response.json(result);
}