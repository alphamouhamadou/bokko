import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const VALID_REASONS = [
  "Comportement inapproprié",
  "Annulation répétée",
  "Paiement non confirmé",
  "Harcèlement",
  "Autre",
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reporterId, reportedId, reason, description } = body

    if (!reporterId || !reportedId) {
      return NextResponse.json({ error: 'reporterId et reportedId sont requis' }, { status: 400 })
    }

    if (reporterId === reportedId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous signaler vous-même' }, { status: 400 })
    }

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Raison invalide' }, { status: 400 })
    }

    if (description && description.length > 500) {
      return NextResponse.json({ error: 'La description ne doit pas dépasser 500 caractères' }, { status: 400 })
    }

    // Verify both users exist
    const [reporter, reported] = await Promise.all([
      db.user.findUnique({ where: { id: reporterId } }),
      db.user.findUnique({ where: { id: reportedId } }),
    ])

    if (!reporter) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (!reported) {
      return NextResponse.json({ error: 'Utilisateur signalé non trouvé' }, { status: 404 })
    }

    const report = await db.report.create({
      data: {
        reporterId,
        reportedId,
        reason,
        description: description?.trim() || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating report:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
