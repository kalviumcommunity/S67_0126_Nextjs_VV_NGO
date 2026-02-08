import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define protected routes and their required roles
  const protectedRoutes: Record<string, string[]> = {
    '/api/users': ['NGO', 'CONTRIBUTOR'],
    '/api/projects': ['NGO', 'CONTRIBUTOR'],
    '/api/tasks': ['NGO', 'CONTRIBUTOR'],
    '/api/dashboard': ['NGO', 'CONTRIBUTOR'],
    '/api/templates': ['NGO', 'CONTRIBUTOR'],
    '/api/pipelines': ['NGO', 'CONTRIBUTOR'],
    '/api/admin': ['NGO'], // Admin routes - only NGO can access
  };

  // Check if the current path is protected
  const isProtected = Object.keys(protectedRoutes).some(route =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // Get authorization header
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, message: 'Authorization token required' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // Check role-based access
  const requiredRoles = protectedRoutes[Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  )!] || [];

  if (!requiredRoles.includes(user.role)) {
    return NextResponse.json(
      { success: false, message: 'Access denied: insufficient permissions' },
      { status: 403 }
    );
  }

  // Add user info to headers for use in API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-user-id', user.id);
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-email', user.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/users/:path*',
    '/api/projects/:path*',
    '/api/tasks/:path*',
    '/api/dashboard/:path*',
    '/api/templates/:path*',
    '/api/pipelines/:path*',
    '/api/admin/:path*',
  ],
};
