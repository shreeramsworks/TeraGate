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
    const response = await fetch(videoUrl, {
      headers: {
        'Referer': 'https://www.terabox.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
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
    }

    // Optimization: Stream the response body directly to the client
    // This allows downloading extremely large files smoothly without loading them into memory
    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download Proxy Error:', error);
    return NextResponse.json({ error: 'Internal server error during download' }, { status: 500 });
  }
}
