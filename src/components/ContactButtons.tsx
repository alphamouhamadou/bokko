'use client'

import { Phone } from 'lucide-react'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

interface ContactButtonsProps {
  phone: string
  name?: string
  variant?: 'full' | 'compact'
  /** Context for WhatsApp message template */
  context?: 'passenger-to-driver' | 'driver-to-passenger' | 'profile'
  /** Trip origin (for passenger-to-driver context) */
  origin?: string
  /** Trip destination (for passenger-to-driver context) */
  destination?: string
  /** Trip date (for passenger-to-driver context) */
  date?: string
}

function cleanPhone(phone: string): string {
  return phone.replace(/\s/g, '')
}

function getWhatsAppLink(phone: string, message: string): string {
  const cleanNumber = cleanPhone(phone)
  const internationalNumber = cleanNumber.startsWith('221') ? cleanNumber : `221${cleanNumber}`
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${internationalNumber}?text=${encodedMessage}`
}

function getPhoneLink(phone: string): string {
  return `tel:${cleanPhone(phone)}`
}

function getWhatsAppMessage(props: ContactButtonsProps): string {
  const { name, context, origin, destination, date } = props

  if (context === 'passenger-to-driver' && origin && destination && date) {
    return `Bonjour ${name || ''} ! Je vous contacte via BOKKO au sujet du trajet ${origin} → ${destination} prévu le ${date}. Merci !`
  }

  if (context === 'driver-to-passenger') {
    return `Bonjour ! Je vous contacte au sujet de votre réservation BOKKO. Merci !`
  }

  // Default / profile
  return `Bonjour ${name || ''} ! Je vous contacte via BOKKO. Merci !`
}

export default function ContactButtons({
  phone,
  name,
  variant = 'full',
  context = 'profile',
  origin,
  destination,
  date,
}: ContactButtonsProps) {
  const whatsappMessage = getWhatsAppMessage({ phone, name, context, origin, destination, date })
  const whatsappLink = getWhatsAppLink(phone, whatsappMessage)
  const phoneLink = getPhoneLink(phone)

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center hover:from-[#20BD5A] hover:to-[#0F7A6E] active:scale-95 transition-all shadow-sm"
          aria-label="Contacter via WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5 text-white" />
        </a>
        <a
          href={phoneLink}
          className="w-10 h-10 rounded-full bg-[#006233] flex items-center justify-center hover:bg-[#006233]/85 active:scale-95 transition-all shadow-sm"
          aria-label="Appeler"
        >
          <Phone className="w-5 h-5 text-white" />
        </a>
      </div>
    )
  }

  // Full variant
  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20BD5A] hover:to-[#0F7A6E] active:scale-[0.98] transition-all text-white font-semibold shadow-md text-sm"
        >
          <WhatsAppIcon className="w-5 h-5" />
          <span>WhatsApp</span>
        </a>
        <a
          href={phoneLink}
          className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#006233] hover:bg-[#006233]/85 active:scale-[0.98] transition-all text-white font-semibold shadow-md text-sm"
        >
          <Phone className="w-5 h-5" />
          <span>Appeler</span>
        </a>
      </div>
      <p className="text-center text-xs text-gray-400">
        {cleanPhone(phone)}
      </p>
    </div>
  )
}
