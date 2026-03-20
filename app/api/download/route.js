import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');
  const filename = searchParams.get('name') || 'video.mp4';

  if (!videoUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    // Optimization: Pre-flight the URL to ensure it's still valid
    const headResponse = await fetch(videoUrl, {
      method: 'HEAD',
      headers: {
        'Referer': 'https://www.terabox.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });

    // Directly redirecting the browser to the CDN link is the ABSOLUTE fastest method.
    // This bypasses the server as a middleman (no double-bandwidth, no proxy delay).
    // The browser handles the download stream directly from the CDN.
    if (headResponse.ok) {
      return NextResponse.redirect(videoUrl);
    }

    // Fallback: If redirect fails or HEAD isn't allowed, use the stream proxy
    const response = await fetch(videoUrl, {
      headers: {
        'Referer': 'https://www.terabox.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: response.status });
    }

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
    
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    headers.set('Cache-Control', 'no-cache');

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download Proxy Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
