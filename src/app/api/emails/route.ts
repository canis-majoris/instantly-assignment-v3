import { NextRequest } from 'next/server';

export async function POST(req: NextRequest): Promise<Response> {
  return Response.json({ status: 'error' }, { status: 400 });
}

export async function GET(req: NextRequest): Promise<Response> {
  return Response.json({ status: 'error' }, { status: 400 });
}
