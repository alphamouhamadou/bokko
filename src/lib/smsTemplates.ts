/**
 * Templates de SMS en français pour BOKKO
 */

interface TripInfo {
  origin: string
  destination: string
  departureTime: string
}

export function reservationConfirmedSMS(trip: TripInfo): string {
  const date = new Date(trip.departureTime)
  const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `BOKKO: Votre reservation ${trip.origin} vers ${trip.destination} est confirmee! Depart le ${dateStr} a ${timeStr}. Bon voyage!`
}

export function reservationRefusedSMS(trip: TripInfo): string {
  return `BOKKO: Votre reservation ${trip.origin} vers ${trip.destination} a ete refusee. Cherchez un autre trajet sur l'app BOKKO.`
}

export function reservationCancelledSMS(trip: TripInfo, reason?: string): string {
  let msg = `BOKKO: Votre reservation ${trip.origin} vers ${trip.destination} a ete annulee.`
  if (reason) msg += ` Motif: ${reason}`
  return msg
}

export function packageAcceptedSMS(trip: TripInfo): string {
  return `BOKKO: Votre colis ${trip.origin} vers ${trip.destination} a ete accepte! Preparez-le pour l'expedition.`
}

export function packageDeliveredSMS(recipientName: string, destination: string): string {
  return `BOKKO: Votre colis pour ${recipientName} a ${destination} a ete livre! Merci d'utiliser BOKKO.`
}

export function departureReminderSMS(trip: TripInfo): string {
  const date = new Date(trip.departureTime)
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `BOKKO: Rappel - Votre trajet ${trip.origin} vers ${trip.destination} part dans 30 min (${timeStr}). Ne soyez pas en retard!`
}

export function passwordResetSMS(otp: string): string {
  return `BOKKO: Votre code de reinitialisation est ${otp}. Valable 10 minutes. Ne le partagez avec personne.`
}

export function newReservationSMS(passengerName: string, trip: TripInfo): string {
  const date = new Date(trip.departureTime)
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `BOKKO: Nouvelle reservation de ${passengerName} pour ${trip.origin} vers ${trip.destination} le ${timeStr}. Confirmez ou refusez dans l'app.`
}
