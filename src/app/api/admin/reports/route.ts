import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const where: any = {}
    if (status) {
      where.status = status
    }

    const reports = await db.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, name: true, phone: true, role: true } },
        reported: { select: { id: true, name: true, phone: true, role: true, isBlocked: true } },
      },
    })

    return NextResponse.json({ reports })
  } catch (error: any) {
    console.error('Admin reports error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des signalements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reporterId, reportedId, reason, description } = body

    if (!reporterId || !reportedId || !reason) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    const report = await db.report.create({
      data: {
        reporterId,
        reportedId,
        reason,
        description: description || null,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error: any) {
    console.error('Create report error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du signalement' },
      { status: 500 }
    )
  }
}
