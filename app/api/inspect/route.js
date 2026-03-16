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

  const apiUrl = `https://tera-core.vercel.app/api?url=${encodeURIComponent(videoUrl)}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'TeraGet-Security-Proxy/1.0',
      }
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { status: 'error', message: 'Upstream server error' },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('API Proxy Error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
