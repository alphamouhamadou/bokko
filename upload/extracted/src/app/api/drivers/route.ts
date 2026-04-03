import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const drivers = await db.user.findMany({
      where: { role: 'DRIVER' },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      drivers: drivers.map((d) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        photoUrl: d.photoUrl,
        bio: d.bio,
        experience: d.experience,
        totalTrips: d.totalTrips,
        averageRating: d.averageRating,
        totalRatings: d.totalRatings,
        vehicle: d.vehicle,
      })),
    })
  } catch (error: any) {
    console.error('Get drivers error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des chauffeurs' },
      { status: 500 }
    )
  }
}
