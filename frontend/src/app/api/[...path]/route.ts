import { NextRequest, NextResponse } from 'next/server';

// Access server-side environment variable (not exposed to client)
const BACKEND_URL = process.env.BACKEND_URL || 'https://luciq-ai-agent-production.up.railway.app/api';

export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    const path = params.path?.join('/') || '';
    const { searchParams } = new URL(request.url);

    const url = `${BACKEND_URL}/${path}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    console.log(`Proxying GET to backend (URL hidden for security)`);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') || '' }
          : {})
      }
    });

    // Handle different response types
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: { 'Content-Type': contentType }
      });
    }
  } catch (error) {
    console.error('API proxy error');
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const path = params.path?.join('/') || '';

    const url = `${BACKEND_URL}/${path}`;

    console.log(`Proxying POST to backend (URL hidden for security)`);

    // Get the body as JSON
    const body = await request.json();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') || '' }
          : {})
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error');
    return NextResponse.json(
      { error: 'Failed to post to backend' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    const path = params.path?.join('/') || '';
    const url = `${BACKEND_URL}/${path}`;

    console.log(`Proxying PUT to backend (URL hidden for security)`);

    const body = await request.json();
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') || '' }
          : {})
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error');
    return NextResponse.json(
      { error: 'Failed to update backend data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    const path = params.path?.join('/') || '';
    const url = `${BACKEND_URL}/${path}`;

    console.log(`Proxying DELETE to backend (URL hidden for security)`);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization')
          ? { 'Authorization': request.headers.get('Authorization') || '' }
          : {})
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API proxy error');
    return NextResponse.json(
      { error: 'Failed to delete backend data' },
      { status: 500 }
    );
  }
}