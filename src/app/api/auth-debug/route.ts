export async function GET() {
  return Response.json({
    nextauth_url: process.env.NEXTAUTH_URL,
    nextauth_secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    database_url: process.env.DATABASE_URL ? 'Set' : 'Missing',
    node_env: process.env.NODE_ENV,
    vercel_url: process.env.VERCEL_URL,
    timestamp: new Date().toISOString()
  });
} 