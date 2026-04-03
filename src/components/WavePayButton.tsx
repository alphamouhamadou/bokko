'use client'

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WavePayButtonProps {
  amount: number
  waveLink: string
  seats?: number
  onClick?: () => void
  className?: string
}

export default function WavePayButton({ amount, waveLink, seats = 1, onClick, className = '' }: WavePayButtonProps) {
  const totalAmount = amount * seats

  const handleClick = () => {
    window.open(waveLink, '_blank', 'noopener,noreferrer')
    onClick?.()
  }

  return (
    <Button
      onClick={handleClick}
      className={`w-full h-14 rounded-2xl bg-gradient-to-r from-[#1DC3E3] to-[#0EA5C9] hover:from-[#1AB8D6] hover:to-[#0D9ABD] text-white font-semibold text-base shadow-lg active:scale-[0.98] transition-all duration-150 gap-2 ${className}`}
    >
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17c1-1 2-2 3-1s2 3 3 2 2-3 3-2 2 1 3 2-1 2-2 3-1 2 3 3 2 2-3 3-2 2 1 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 13c1-1 2-2 3-1s2 3 3 2 2-3 3-2 2 1 3 2-1 2-2 3-1 2 3 3 2 2-3 3-2 2 1 3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="flex-1 text-left">
        Payer avec Wave
      </span>
      <span className="text-white/90 text-sm font-medium">
        {totalAmount.toLocaleString()} FCFA
      </span>
      <ExternalLink className="w-4 h-4 flex-shrink-0" />
    </Button>
  )
}
