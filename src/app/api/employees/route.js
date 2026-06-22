import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Returns all employees from the database. If the DB is not configured/reachable,
// responds 503 so the client can fall back to the static /data JSON.
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({ orderBy: { id: 'asc' } })
    return Response.json(employees)
  } catch {
    return new Response(JSON.stringify({ error: 'db_unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json' },
    })
  }
}
