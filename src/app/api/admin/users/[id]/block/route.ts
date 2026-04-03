import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isBlocked, blockedReason } = body

    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Impossible de bloquer un administrateur' }, { status: 403 })
    }

    const updated = await db.user.update({
      where: { id },
      data: {
        isBlocked: !!isBlocked,
        blockedReason: isBlocked ? blockedReason || 'Activité suspecte détectée' : null,
        blockedAt: isBlocked ? new Date() : null,
      },
      select: { id: true, name: true, isBlocked: true, blockedReason: true, blockedAt: true },
    })

    return NextResponse.json({ user: updated })
  } catch (error: any) {
    console.error('Block user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification du statut' },
      { status: 500 }
    )
  }
}
