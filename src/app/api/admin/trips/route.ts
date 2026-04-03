import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const origin = searchParams.get('origin') || ''
    const destination = searchParams.get('destination') || ''

    const where: any = {}
    if (status) where.status = status
    if (origin) where.origin = { contains: origin }
    if (destination) where.destination = { contains: destination }

    const [trips, total] = await Promise.all([
      db.trip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          driver: { select: { id: true, name: true, phone: true } },
          _count: { select: { reservations: true, packages: true } },
        },
      }),
      db.trip.count({ where }),
    ])

    return NextResponse.json({
      trips,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error: any) {
    console.error('Admin trips error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des trajets' },
      { status: 500 }
    )
  }
}
