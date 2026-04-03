import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const existing = await db.user.findFirst({ where: { role: 'ADMIN' } })
    if (existing) {
      return NextResponse.json({ message: 'Admin déjà existant', phone: existing.phone })
    }

    const password = await bcrypt.hash('admin123', 10)
    const admin = await db.user.create({
      data: {
        phone: '770000000',
        password,
        name: 'Admin BOKKO',
        role: 'ADMIN',
      },
    })

    return NextResponse.json({ message: 'Admin créé', phone: admin.phone, name: admin.name })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'Admin déjà existant (conflit téléphone)' })
    }
    console.error('Init admin error:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
