import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');
  const filename = searchParams.get('name') || 'video.mp4';

  if (!videoUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    // Fetch the video from the CDN with Terabox-specific headers
    // Using a more robust User-Agent and potentially better range handling if needed
    const response = await fetch(videoUrl, {
      headers: {
        'Referer': 'https://www.terabox.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video from upstream source' },
        { status: response.status }
      );
    }

    // Prepare response headers for streaming and download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
    
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
      // Ensure X-Content-Length is also set for some browsers/tools
      headers.set('X-Content-Length', contentLength);
    }

    // Add headers to prevent caching and allow chunked transfer
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Optimization: Stream the response body directly to the client
    // We use a TransformStream to ensure the pipe is as fast as possible in Next.js/Edge environments
    const { readable, writable } = new TransformStream();
    response.body.pipeTo(writable);

    return new Response(readable, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download Proxy Error:', error);
    return NextResponse.json({ error: 'Internal server error during download' }, { status: 500 });
  }
}
