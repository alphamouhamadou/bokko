import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status || !['CONFIRMED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide. Utilisez CONFIRMED ou CANCELLED' },
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

    const updatedReservation = await db.reservation.update({
      where: { id },
      data: { status },
      include: {
        trip: {
          include: {
            driver: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        passenger: {
          select: { id: true, name: true, phone: true },
        },
      },
    })

    // Notify passenger about confirmation or refusal
    try {
      if (status === 'CONFIRMED') {
        await db.notification.create({
          data: {
            userId: reservation.passengerId,
            type: 'RESERVATION_CONFIRMED',
            title: 'Réservation confirmée',
            message: `Votre réservation pour le trajet ${reservation.trip.origin} → ${reservation.trip.destination} a été confirmée par ${reservation.trip.driver.name}.`,
            data: JSON.stringify({ reservationId: id, tripId: reservation.tripId }),
          },
        })
      } else if (status === 'CANCELLED') {
        await db.notification.create({
          data: {
            userId: reservation.passengerId,
            type: 'RESERVATION_REFUSED',
            title: 'Réservation refusée',
            message: `Votre réservation pour le trajet ${reservation.trip.origin} → ${reservation.trip.destination} a été refusée par ${reservation.trip.driver.name}.`,
            data: JSON.stringify({ reservationId: id, tripId: reservation.tripId }),
          },
        })
      }
    } catch (notifErr) {
      console.error('Failed to send notification:', notifErr)
    }

    return NextResponse.json({ reservation: updatedReservation })
  } catch (error: any) {
    console.error('Update reservation error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la réservation' },
      { status: 500 }
    )
  }
}
