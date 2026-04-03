import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { photoUrl } = body

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Photo requise' },
        { status: 400 }
      )
    }

    const pkg = await db.package.findUnique({
      where: { id },
      include: { trip: true, sender: { select: { id: true, name: true } } },
    })

    if (!pkg) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    const updatedPkg = await db.package.update({
      where: { id },
      data: {
        deliveryProofUrl: photoUrl,
        status: 'DELIVERED',
      },
      include: {
        trip: {
          include: {
            driver: { select: { id: true, name: true, phone: true } },
          },
        },
        sender: { select: { id: true, name: true, phone: true } },
      },
    })

    // Notify sender about delivery with proof
    try {
      await db.notification.create({
        data: {
          userId: pkg.senderId,
          type: 'RESERVATION_CONFIRMED',
          title: '📦 Colis livré avec preuve',
          message: `Votre colis "${pkg.description}" (${pkg.trip.origin} → ${pkg.trip.destination}) a été livré. Une photo de preuve est disponible.`,
          data: JSON.stringify({ packageId: pkg.id, tripId: pkg.tripId }),
        },
      })
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr)
    }

    return NextResponse.json({ package: updatedPkg })
  } catch (error: any) {
    console.error('Delivery proof error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde de la preuve' },
      { status: 500 }
    )
  }
}
