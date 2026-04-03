import { NextRequest, NextResponse } from 'next/server'

// Simplified: no FavoriteDriver model, always return false
export async function GET(request: NextRequest) {
  return NextResponse.json({ isFavorite: false })
}
