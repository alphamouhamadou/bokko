import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Middleware/helper that any API call requiring auth can call to update lastActivity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Identifiant utilisateur requis' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Check if account is soft-deleted
    if (user.deletedAt) {
      return NextResponse.json(
        { error: 'Compte supprimé', deleted: true },
        { status: 403 }
      )
    }

    // Update lastActivity
    await db.user.update({
      where: { id: userId },
      data: { lastActivity: new Date() },
    })

    return NextResponse.json({
      message: 'Activité mise à jour.',
      lastActivity: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Update activity error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}
