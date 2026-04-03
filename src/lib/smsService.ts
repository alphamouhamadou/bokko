/**
 * Service SMS — Envoi de SMS pour les événements clés de BOKKO
 * Fire-and-forget: les erreurs SMS ne bloquent jamais l'opération principale
 */

import { sendSMS } from './sms'
import * as templates from './smsTemplates'
import { db } from '@/lib/db'

async function getUserPhone(userId: string): Promise<string | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    })
    return user?.phone || null
  } catch {
    return null
  }
}

async function getTripInfo(tripId: string): Promise<{ origin: string; destination: string; departureTime: string } | null> {
  try {
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      select: { origin: true, destination: true, departureTime: true },
    })
    return trip ? { origin: trip.origin, destination: trip.destination, departureTime: trip.departureTime.toISOString() } : null
  } catch {
    return null
  }
}

async function getPackageInfo(packageId: string): Promise<{ recipientName: string; destination: string } | null> {
  try {
    const pkg = await db.package.findUnique({
      where: { id: packageId },
      select: { recipientName: true },
    })
    if (!pkg) return null

    const trip = await db.trip.findFirst({
      where: { packages: { some: { id: packageId } } },
      select: { destination: true },
    })

    return trip ? { recipientName: pkg.recipientName, destination: trip.destination } : null
  } catch {
    return null
  }
}

async function getUserById(userId: string): Promise<{ name: string; phone: string } | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    })
    return user
  } catch {
    return null
  }
}

/**
 * SMS réservation confirmée → envoyé au passager
 */
export async function sendReservationConfirmation(userId: string, tripId: string): Promise<void> {
  try {
    const [phone, trip] = await Promise.all([getUserPhone(userId), getTripInfo(tripId)])
    if (!phone || !trip) return

    await sendSMS(phone, templates.reservationConfirmedSMS(trip))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendReservationConfirmation:', error.message)
  }
}

/**
 * SMS réservation refusée → envoyé au passager
 */
export async function sendReservationRefusal(userId: string, tripId: string): Promise<void> {
  try {
    const [phone, trip] = await Promise.all([getUserPhone(userId), getTripInfo(tripId)])
    if (!phone || !trip) return

    await sendSMS(phone, templates.reservationRefusedSMS(trip))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendReservationRefusal:', error.message)
  }
}

/**
 * SMS réservation annulée → envoyé au passager
 */
export async function sendReservationCancellation(userId: string, tripId: string, reason?: string): Promise<void> {
  try {
    const [phone, trip] = await Promise.all([getUserPhone(userId), getTripInfo(tripId)])
    if (!phone || !trip) return

    await sendSMS(phone, templates.reservationCancelledSMS(trip, reason))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendReservationCancellation:', error.message)
  }
}

/**
 * SMS nouvelle réservation → envoyé au chauffeur
 */
export async function sendNewReservationNotification(driverId: string, passengerId: string, tripId: string): Promise<void> {
  try {
    const [driver, trip] = await Promise.all([getUserById(driverId), getTripInfo(tripId)])
    if (!driver?.phone || !trip) return

    await sendSMS(driver.phone, templates.newReservationSMS(driver.name, trip))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendNewReservationNotification:', error.message)
  }
}

/**
 * SMS colis accepté → envoyé à l'expéditeur
 */
export async function sendPackageAccepted(userId: string, packageId: string): Promise<void> {
  try {
    const [phone, trip] = await Promise.all([getUserPhone(userId), getTripInfoFromPackage(packageId)])
    if (!phone || !trip) return

    await sendSMS(phone, templates.packageAcceptedSMS(trip))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendPackageAccepted:', error.message)
  }
}

/**
 * SMS colis livré → envoyé à l'expéditeur
 */
export async function sendPackageDelivered(userId: string, packageId: string): Promise<void> {
  try {
    const phone = await getUserPhone(userId)
    const pkgInfo = await getPackageInfo(packageId)
    if (!phone || !pkgInfo) return

    await sendSMS(phone, templates.packageDeliveredSMS(pkgInfo.recipientName, pkgInfo.destination))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendPackageDelivered:', error.message)
  }
}

/**
 * SMS rappel départ → envoyé au passager
 */
export async function sendDepartureReminder(userId: string, tripId: string): Promise<void> {
  try {
    const [phone, trip] = await Promise.all([getUserPhone(userId), getTripInfo(tripId)])
    if (!phone || !trip) return

    await sendSMS(phone, templates.departureReminderSMS(trip))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendDepartureReminder:', error.message)
  }
}

/**
 * SMS code OTP → envoyé au numéro fourni
 */
export async function sendPasswordReset(phone: string, otp: string): Promise<void> {
  try {
    await sendSMS(phone, templates.passwordResetSMS(otp))
  } catch (error: any) {
    console.error('[SMS Service] Erreur sendPasswordReset:', error.message)
  }
}

// Helper: récupérer les infos du trajet via un colis
async function getTripInfoFromPackage(packageId: string): Promise<{ origin: string; destination: string; departureTime: string } | null> {
  try {
    const pkg = await db.package.findUnique({
      where: { id: packageId },
      select: { tripId: true },
    })
    if (!pkg) return null
    return getTripInfo(pkg.tripId)
  } catch {
    return null
  }
}
