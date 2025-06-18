import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    return Response.json({
      token: token ? 'Present' : 'Missing',
      tokenDetails: token ? {
        id: token.id,
        email: token.email,
        role: token.role,
        sub: token.sub
      } : null,
      nextauth_url: process.env.NEXTAUTH_URL,
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      nextauth_url: process.env.NEXTAUTH_URL,
      nextauth_secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    });
  }
} 