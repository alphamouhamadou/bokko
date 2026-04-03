import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, password } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'Identifiant utilisateur requis' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Mot de passe requis pour confirmer la suppression' },
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

    // Verify password for security
    const bcrypt = await import('bcryptjs')
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Soft delete: set deletedAt timestamp
    await db.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        resetToken: null,
        resetExpires: null,
      },
    })

    return NextResponse.json({
      message: 'Compte supprimé avec succès.',
    })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du compte' },
      { status: 500 }
    )
  }
}
