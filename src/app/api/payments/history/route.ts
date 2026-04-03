import { NextRequest, NextResponse } from 'next/server'

// Simplified: no Payment model in schema, return empty array
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ payments: [], total: 0 })
  }

  return NextResponse.json({
    payments: [],
    total: 0,
  })
}
