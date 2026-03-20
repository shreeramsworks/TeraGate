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
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json(
      { status: 'error', message: 'No URL provided' },
      { status: 400 }
    );
  }

  // Sanitize and validate the URL (ensure it's a Terabox link)
  const isTerabox = /(?:terabox|terashare|1024tera|teraboxcdn)/.test(videoUrl);
  if (!isTerabox) {
    return NextResponse.json(
      { status: 'error', message: 'Invalid domain' },
      { status: 400 }
    );
  }

  try {
    // Phase 1: Get file metadata and session details
    const res = await fetch('https://teradl-api.dapuntaratya.com/generate_file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({ url: videoUrl })
    });
    
    const rawData = await res.json();
    
    if (rawData.status !== 'success' || !rawData.list?.[0]) {
       return NextResponse.json({ status: 'error', message: 'Link not found or expired.' });
    }

    const file = rawData.list[0];
    
    // Phase 2: Generate the ACTUAL high-speed download link
    const linkRes = await fetch('https://teradl-api.dapuntaratya.com/generate_link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uk: rawData.uk,
        shareid: rawData.shareid,
        timestamp: rawData.timestamp,
        sign: rawData.sign,
        js_token: rawData.js_token, // Critical: pass the token from Phase 1
        cookie: rawData.cookie,     // Critical: pass the cookie session
        fs_id: file.fs_id
      })
    });

    const linkData = await linkRes.json();
    
    // We prioritize the 'fast' link (url_3) according to the reference
    const finalDownloadLink = linkData.download_link?.url_3 || linkData.download_link?.url_2 || linkData.download_link?.url_1 || '';

    return NextResponse.json({
      status: 'success',
      files: [{
        filename: file.name,
        size_bytes: file.size,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        download_link: finalDownloadLink,
        thumbnails: { '850x580': file.image }
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
