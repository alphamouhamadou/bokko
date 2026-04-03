import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, otp, newPassword } = body

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Téléphone, code OTP et nouveau mot de passe requis' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Clean phone to digits only
    const digits = phone.replace(/\D/g, '')

    // Find user with active reset token
    const user = await db.user.findFirst({
      where: {
        phone: digits,
        resetToken: { not: null },
        resetExpires: { gt: new Date() },
      },
    })

    if (!user || !user.resetToken) {
      return NextResponse.json(
        { error: 'Code invalide ou expiré' },
        { status: 400 }
      )
    }

    // Verify OTP against stored hash
    const isValid = await bcrypt.compare(otp, user.resetToken)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Code OTP incorrect' },
        { status: 400 }
      )
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}
