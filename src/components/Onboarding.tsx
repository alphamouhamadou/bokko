'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/store'

const slides = [
  {
    emoji: '🚗🇸🇳',
    title: 'Bienvenue sur BOKKO',
    description: 'Le covoiturage simple au Sénégal',
    bg: 'from-[#006233] to-[#004d28]',
  },
  {
    emoji: '🔍',
    title: 'Cherchez votre trajet',
    description: 'Thiès, Dakar, Thiènaba en un clic',
    bg: 'from-[#006233] to-[#008040]',
  },
  {
    emoji: '📦',
    title: 'Envoyez vos colis',
    description: 'Faites livrer vos colis en toute sécurité',
    bg: 'from-[#008040] to-[#00a050]',
  },
  {
    emoji: '💳',
    title: 'Payez facilement',
    description: 'Wave, Orange Money ou Cash',
    bg: 'from-[#FFD700] to-[#FFC107]',
    titleDark: true,
  },
]

export default function Onboarding() {
  const setOnboardingCompleted = useAppStore((s) => s.setOnboardingCompleted)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToNext = () => {
    if (currentSlide === slides.length - 1) {
      // Last slide: complete onboarding
      setOnboardingCompleted(true)
      return
    }
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide((prev) => prev + 1)
      setIsTransitioning(false)
    }, 200)
  }

  const skip = () => {
    setOnboardingCompleted(true)
  }

  const goToSlide = (index: number) => {
    if (index === currentSlide) return
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(index)
      setIsTransitioning(false)
    }, 200)
  }

  const isLastSlide = currentSlide === slides.length - 1
  const slide = slides[currentSlide]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Slide Card */}
        <div
          className={`w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Top gradient area */}
          <div className={`bg-gradient-to-br ${slide.bg} px-8 pt-10 pb-8 flex flex-col items-center`}>
            <div className="w-28 h-28 bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-5 shadow-lg border border-white/20">
              <span className="text-6xl">{slide.emoji}</span>
            </div>
          </div>

          {/* Text area */}
          <div className="px-8 py-8 text-center">
            <h2
              className={`text-2xl font-bold mb-3 leading-tight ${
                slide.titleDark ? 'text-[#006233]' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {slide.title}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {slide.description}
            </p>
          </div>

          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-2 pb-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-[#006233] dark:bg-green-400'
                    : 'w-2.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                aria-label={`Diapositive ${index + 1}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="px-8 pb-8 space-y-3">
            <button
              onClick={goToNext}
              className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg transition-all active:scale-[0.98]"
            >
              {isLastSlide ? '🚀 COMMENCER' : 'SUIVANT →'}
            </button>

            {!isLastSlide && (
              <button
                onClick={skip}
                className="w-full py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Passer
              </button>
            )}
          </div>
        </div>

        {/* Logo */}
        <div className="mt-8 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#006233] rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-[#FFD700]">B</span>
          </div>
          <span className="text-sm font-semibold text-white/70">BOKKO</span>
        </div>
      </div>
    </div>
  )
}
