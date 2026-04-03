import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { sendSMS } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      )
    }

    // Clean phone to digits only
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      return NextResponse.json(
        { success: true }
      )
    }

    // Find user by phone
    const user = await db.user.findUnique({ where: { phone: digits } })

    // Always return success to prevent account enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Generate 4-digit OTP
    const otp = crypto.randomInt(1000, 10000).toString()
    const hashedOtp = await bcrypt.hash(otp, 10)

    // Store hashed OTP with 10 minute expiry
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedOtp,
        resetExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    // Send OTP via SMS (fire and forget)
    const smsMessage = `[BOKKO] Votre code de réinitialisation est : ${otp}. Ce code expire dans 10 minutes.`
    sendSMS(user.phone, smsMessage).catch((err) => {
      console.error('Failed to send OTP SMS:', err)
    })

    // In development mode, return the OTP for testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ success: true, otp })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: true }
    )
  }
}
