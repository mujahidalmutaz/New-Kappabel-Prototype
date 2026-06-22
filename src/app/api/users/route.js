import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Returns all login accounts from the database. Falls back via 503 when DB absent.
export async function GET() {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })
    return Response.json(users)
  } catch {
    return new Response(JSON.stringify({ error: 'db_unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json' },
    })
  }
}
