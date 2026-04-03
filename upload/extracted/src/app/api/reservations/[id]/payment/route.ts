import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { paymentStatus, paymentMethod } = body

    if (!paymentStatus || !['PAID', 'CONFIRMED_BY_DRIVER'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Statut de paiement invalide. Utilisez PAID ou CONFIRMED_BY_DRIVER' },
        { status: 400 }
      )
    }

    if (paymentMethod && !['CASH', 'WAVE'].includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide. Utilisez CASH ou WAVE' },
        { status: 400 }
      )
    }

    const reservation = await db.reservation.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            driver: { select: { id: true, name: true } },
          },
        },
        passenger: { select: { id: true, name: true } },
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      )
    }

    const updateData: Record<string, any> = {
      paymentStatus,
    }

    // Set payment method from request or default based on context
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod
    } else if (paymentStatus === 'PAID') {
      // If no method specified, default to WAVE for backward compatibility
      updateData.paymentMethod = 'WAVE'
    }

    if (paymentStatus === 'PAID') {
      updateData.paidAt = new Date()
    }

    const updatedReservation = await db.reservation.update({
      where: { id },
      data: updateData,
      include: {
        trip: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true, waveBusinessLink: true },
            },
          },
        },
        passenger: {
          select: { id: true, name: true, phone: true },
        },
      },
    })

    // Send notifications based on payment status change
    try {
      const methodLabel = paymentMethod === 'CASH' ? 'en espèces' : 'via Wave'

      if (paymentStatus === 'PAID') {
        // Notify driver that passenger has paid
        await db.notification.create({
          data: {
            userId: reservation.trip.driverId,
            type: 'NEW_RESERVATION',
            title: 'Paiement reçu',
            message: `${reservation.passenger.name} a effectué le paiement ${methodLabel} de ${(reservation.seatsBooked * reservation.trip.pricePerSeat).toLocaleString()} FCFA pour le trajet ${reservation.trip.origin} → ${reservation.trip.destination}.`,
            data: JSON.stringify({ reservationId: id, tripId: reservation.tripId }),
          },
        })
      } else if (paymentStatus === 'CONFIRMED_BY_DRIVER') {
        // Notify passenger that driver confirmed payment
        const confirmMethod = reservation.paymentMethod === 'CASH' ? 'en espèces' : 'via Wave'
        await db.notification.create({
          data: {
            userId: reservation.passengerId,
            type: 'RESERVATION_CONFIRMED',
            title: 'Paiement confirmé par le chauffeur',
            message: `${reservation.trip.driver.name} a confirmé la réception de votre paiement ${confirmMethod} pour le trajet ${reservation.trip.origin} → ${reservation.trip.destination}.`,
            data: JSON.stringify({ reservationId: id, tripId: reservation.tripId }),
          },
        })
      }
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr)
    }

    return NextResponse.json({ reservation: updatedReservation })
  } catch (error: any) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du paiement' },
      { status: 500 }
    )
  }
}
