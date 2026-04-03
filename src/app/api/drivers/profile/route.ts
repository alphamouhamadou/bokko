import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { driverId, photoUrl, bio, experience, waveBusinessLink } = body

    if (!driverId) {
      return NextResponse.json({ error: 'driverId est requis' }, { status: 400 })
    }

    const driver = await db.user.findUnique({ where: { id: driverId } })
    if (!driver || driver.role !== 'DRIVER') {
      return NextResponse.json({ error: 'Chauffeur non trouvé' }, { status: 404 })
    }

    const updatedDriver = await db.user.update({
      where: { id: driverId },
      data: {
        ...(photoUrl !== undefined ? { photoUrl } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(experience !== undefined ? { experience: parseInt(experience) } : {}),
        ...(waveBusinessLink !== undefined ? { waveBusinessLink } : {}),
      },
      include: { vehicle: true },
    })

    return NextResponse.json({
      driver: {
        id: updatedDriver.id,
        name: updatedDriver.name,
        phone: updatedDriver.phone,
        photoUrl: updatedDriver.photoUrl,
        bio: updatedDriver.bio,
        experience: updatedDriver.experience,
        totalTrips: updatedDriver.totalTrips,
        averageRating: updatedDriver.averageRating,
        totalRatings: updatedDriver.totalRatings,
        waveBusinessLink: updatedDriver.waveBusinessLink,
        vehicle: updatedDriver.vehicle,
      },
    })
  } catch (error: any) {
    console.error('Update driver profile error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}
