import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const LIMIT = 5; // 5 requests
const WINDOW_MS = 60 * 1000; // per 1 minute

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const now = Date.now();
  
  // Rate limiting logic
  const userData = rateLimitMap.get(ip) || { count: 0, startTime: now };
  
  if (now - userData.startTime > WINDOW_MS) {
    userData.count = 1;
    userData.startTime = now;
  } else {
    userData.count++;
  }
  
  rateLimitMap.set(ip, userData);
  
  if (userData.count > LIMIT) {
    return NextResponse.json(
      { status: 'error', message: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  let videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json(
      { status: 'error', message: 'No URL provided' },
      { status: 400 }
    );
  }

  // Ensure the URL is properly formatted for the API
  if (!videoUrl.startsWith('http')) {
    videoUrl = 'https://terabox.com/s/' + videoUrl;
  }

  try {
    // Phase 1: Call the reliable extraction API
    const res = await fetch('https://teradl-api.dapuntaratya.com/generate_file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({ url: videoUrl.trim() })
    });
    
    if (!res.ok) {
       // Fallback: If Stage 1 fails, the API might be down or blocked. 
       // We can return a specific error to help you debug.
       return NextResponse.json({ status: 'error', message: `API Down (${res.status})` });
    }

    const rawData = await res.json();
    
    // DEBUG: Log the full raw response to your Vercel logs so we can see what's happening
    console.log('Stage 1 rawData:', JSON.stringify(rawData));

    if (rawData.status !== 'success' || !rawData.list || rawData.list.length === 0) {
       // The API didn't return any files.
       return NextResponse.json({ 
         status: 'error', 
         message: 'The link could not be processed. It may be private, expired, or require a password.' 
       });
    }

    // Stage 2: Target the largest or first file for high-speed link generation
    const file = rawData.list[0];
    
    // Phase 2: Generate link using full session state from Phase 1
    const linkRes = await fetch('https://teradl-api.dapuntaratya.com/generate_link', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        uk: rawData.uk,
        shareid: rawData.shareid,
        timestamp: rawData.timestamp,
        sign: rawData.sign,
        js_token: rawData.js_token,
        cookie: rawData.cookie,
        fs_id: file.fs_id
      })
    });

    const linkData = await linkRes.json();
    console.log('Stage 2 linkData:', JSON.stringify(linkData));
    
    // Final check for generated links
    const dl = linkData.download_link;
    const finalDownloadLink = dl?.url_3 || dl?.url_2 || dl?.url_1 || '';

    if (!finalDownloadLink) {
       return NextResponse.json({ status: 'error', message: 'Download link generation failed.' });
    }

    return NextResponse.json({
      status: 'success',
      files: [{
        filename: file.name,
        size_bytes: file.size,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        download_link: finalDownloadLink,
        thumbnails: { '850x580': file.image || '' }
      }]
    });
  } catch (err) {
    console.error('API Proxy Error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
