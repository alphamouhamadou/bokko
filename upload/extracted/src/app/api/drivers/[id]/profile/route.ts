import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const driver = await db.user.findUnique({
      where: { id },
      include: { vehicle: true },
    })

    if (!driver || driver.role !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Chauffeur non trouvé' },
        { status: 404 }
      )
    }

    const ratings = await db.rating.findMany({
      where: { toUserId: id },
      include: {
        fromUser: { select: { id: true, name: true } },
        trip: { select: { origin: true, destination: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalTrips = await db.trip.count({
      where: { driverId: id, status: 'ACTIVE' },
    })

    return NextResponse.json({
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        photoUrl: driver.photoUrl,
        bio: driver.bio,
        experience: driver.experience,
        totalTrips: driver.totalTrips || totalTrips,
        averageRating: driver.averageRating,
        totalRatings: driver.totalRatings,
        waveBusinessLink: driver.waveBusinessLink,
        vehicle: driver.vehicle,
      },
      ratings,
    })
  } catch (error: any) {
    console.error('Get driver profile error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}
