import { env } from './env';

const staticAllowed = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://tribhuvancollege.ac.in',
];

export function isOriginAllowed(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void {
  // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
  if (!origin) {
    return callback(null, true);
  }

  const allowedList = [...staticAllowed];

  if (env.CLIENT_URL) {
    allowedList.push(...env.CLIENT_URL.split(',').map((s) => s.trim()));
  }
  if (env.ALLOWED_ORIGINS) {
    allowedList.push(...env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()));
  }

  // Exact match check
  if (allowedList.includes(origin)) {
    return callback(null, true);
  }

  try {
    const url = new URL(origin);
    // Allow Vercel deployment domains (*.vercel.app)
    if (url.hostname.endsWith('.vercel.app') || url.hostname === 'vercel.app') {
      return callback(null, true);
    }
    // Allow college domain & subdomains
    if (url.hostname.endsWith('.tribhuvancollege.ac.in') || url.hostname === 'tribhuvancollege.ac.in') {
      return callback(null, true);
    }
  } catch {
    // Invalid URL structure
  }

  return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
}
