import { NextRequest, NextResponse } from 'next/server'
import { sendSMS, getSMSProviderStatus } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, message } = body

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et message sont requis' },
        { status: 400 }
      )
    }

    const result = await sendSMS(phone, message)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Erreur lors de l\'envoi du SMS' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error: any) {
    console.error('SMS send error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du SMS' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const status = getSMSProviderStatus()
    return NextResponse.json(status)
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du statut SMS' },
      { status: 500 }
    )
  }
}
