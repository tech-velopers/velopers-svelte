import type { RequestHandler } from './$types';

const API_BASE_URL = 'https://tech-blog-hub.vercel.app';

export const GET: RequestHandler = async ({ params, url, request }) => {
  const path = params.path;
  const searchParams = url.searchParams.toString();
  const apiUrl = `${API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: RequestHandler = async ({ params, request }) => {
  const path = params.path;
  const apiUrl = `${API_BASE_URL}/${path}`;

  try {
    const body = await request.text();
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': request.headers.get('user-agent') || '',
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};