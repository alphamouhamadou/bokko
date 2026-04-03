import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { confirmationCode } = body

    if (!confirmationCode) {
      return NextResponse.json(
        { error: 'Code de confirmation requis' },
        { status: 400 }
      )
    }

    const pkg = await db.package.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            driver: { select: { id: true, name: true, phone: true } },
          },
        },
        sender: { select: { id: true, name: true, phone: true } },
      },
    })

    if (!pkg) {
      return NextResponse.json(
        { error: 'Colis non trouvé' },
        { status: 404 }
      )
    }

    // Verify confirmation code
    if (pkg.confirmationCode !== confirmationCode) {
      return NextResponse.json(
        { error: 'Code de confirmation incorrect' },
        { status: 400 }
      )
    }

    // Check if already confirmed
    if (pkg.confirmedByRecipient) {
      return NextResponse.json(
        { error: 'Ce colis a déjà été confirmé' },
        { status: 400 }
      )
    }

    // Confirm the delivery
    const updatedPkg = await db.package.update({
      where: { id },
      data: {
        confirmedByRecipient: true,
        confirmedAt: new Date(),
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

    // Notify driver and sender
    try {
      await db.notification.create({
        data: {
          userId: pkg.trip.driverId,
          type: 'RESERVATION_CONFIRMED',
          title: '✅ Colis confirmé par le destinataire',
          message: `Le colis "${pkg.description}" (${pkg.trip.origin} → ${pkg.trip.destination}) a été confirmé par ${pkg.recipientName}.`,
          data: JSON.stringify({ packageId: pkg.id, tripId: pkg.tripId }),
        },
      })

      await db.notification.create({
        data: {
          userId: pkg.senderId,
          type: 'RESERVATION_CONFIRMED',
          title: '✅ Colis confirmé par le destinataire',
          message: `Votre colis "${pkg.description}" (${pkg.trip.origin} → ${pkg.trip.destination}) a été confirmé par le destinataire ${pkg.recipientName}.`,
          data: JSON.stringify({ packageId: pkg.id, tripId: pkg.tripId }),
        },
      })
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr)
    }

    return NextResponse.json({
      package: updatedPkg,
      message: 'Livraison confirmée avec succès !',
    })
  } catch (error: any) {
    console.error('Confirm delivery error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation' },
      { status: 500 }
    )
  }
}
