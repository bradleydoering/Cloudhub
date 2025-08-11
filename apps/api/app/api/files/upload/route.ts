import { generateRequestId, checkRateLimit, logRequest, scanFile } from '../../../lib/middleware';

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    // Basic rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(`upload_${clientIP}`, 10, 60 * 1000); // 10 uploads per minute
    
    if (!rateLimit.allowed) {
      logRequest({
        requestId,
        method: 'POST',
        url: '/api/files/upload',
        ip: clientIP,
        status: 429,
        duration: Date.now() - startTime,
        error: 'Rate limit exceeded'
      });
      
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Remaining': '0',
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // File size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Virus scan
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const scanResult = await scanFile(fileBuffer, file.name);
    
    if (!scanResult.clean) {
      logRequest({
        requestId,
        method: 'POST',
        url: '/api/files/upload',
        ip: clientIP,
        status: 400,
        duration: Date.now() - startTime,
        error: `Virus detected: ${scanResult.threats?.join(', ')}`
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'File failed security scan',
          threats: scanResult.threats 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate signed URL for R2 upload
    const { generateSignedUploadUrl } = await import('@cloudreno/lib');
    
    const uploadOptions = {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      fileType: 'document' as const, // Default, should be passed from client
      organizationId: 'default-org', // Should be passed from authenticated user
    };

    const signedUpload = await generateSignedUploadUrl(uploadOptions);
    
    const response = {
      success: true,
      fileId: `file_${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadUrl: signedUpload.uploadUrl,
      publicUrl: signedUpload.publicUrl,
      fileKey: signedUpload.fileKey,
      expiresIn: signedUpload.expiresIn
    };
    
    logRequest({
      requestId,
      method: 'POST', 
      url: '/api/files/upload',
      ip: clientIP,
      status: 200,
      duration: Date.now() - startTime
    });
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      }
    );
    
  } catch (error) {
    console.error('Upload error:', error);
    
    logRequest({
      requestId,
      method: 'POST',
      url: '/api/files/upload',
      status: 500,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return new Response(
      JSON.stringify({ error: 'Upload failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}