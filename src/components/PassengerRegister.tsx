'use client'

import { useState, useRef, useEffect } from 'react'
import { Phone, User, Lock, Eye, EyeOff, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function PassengerRegister() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const setView = useAppStore((s) => s.setView)
  const setUser = useAppStore((s) => s.setUser)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 1) phoneInputRef.current?.focus()
    if (step === 2) nameInputRef.current?.focus()
    if (step === 3) passwordInputRef.current?.focus()
  }, [step])

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    // Auto-advance after 9 digits
    if (formatted.replace(/\D/g, '').length >= 9) {
      setTimeout(() => setStep(2), 300)
    }
  }

  const handleRegister = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      toast.error('Numéro de téléphone invalide')
      return
    }
    if (!name || name.length < 2) {
      toast.error('Entrez votre nom')
      return
    }
    if (!password || password.length < 6) {
      toast.error('Mot de passe trop court (min. 6 caractères)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, name, password, role: 'PASSENGER' }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'inscription')
        return
      }
      setUser(data.user)
      toast.success('Inscription réussie !')
      setView('passenger-dashboard')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const stepEmojis = ['📱', '✍️', '🔒', '✅']
  const stepLabels = ['Téléphone', 'Nom', 'Mot de passe', 'Valider']

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base transition-all ${
                  s === step
                    ? 'bg-[#006233] text-white scale-110 shadow-lg'
                    : s < step
                    ? 'bg-[#006233]/20 text-[#006233]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s < step ? '✓' : stepEmojis[s - 1]}
              </div>
              <span className={`text-[9px] font-medium ${s === step ? 'text-[#006233]' : 'text-gray-400'}`}>
                {stepLabels[s - 1]}
              </span>
            </div>
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#006233]">
            {step === 1 && '📱 Votre téléphone'}
            {step === 2 && '✍️ Votre nom'}
            {step === 3 && '🔒 Votre mot de passe'}
            {step === 4 && '✅ Créer votre compte'}
          </h2>
        </div>

        {/* Step 1: Phone */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={phoneInputRef}
                type="tel"
                inputMode="numeric"
                placeholder="77 123 45 67"
                className="pl-12 h-16 rounded-2xl text-2xl text-center font-semibold tracking-wider border-2 border-gray-200 focus:border-[#006233]"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={13}
              />
            </div>
            <Button
              type="button"
              onClick={() => {
                if (phone.replace(/\D/g, '').length >= 9) setStep(2)
                else toast.error('Entrez 9 chiffres')
              }}
              className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg"
            >
              SUIVANT <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={nameInputRef}
                placeholder="Votre prénom"
                className="pl-12 h-16 rounded-2xl text-2xl text-center font-semibold border-2 border-gray-200 focus:border-[#006233]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 min-h-[56px] rounded-2xl font-bold text-base border-2"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> RETOUR
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!name || name.length < 2) { toast.error('Entrez votre nom'); return }
                  setStep(3)
                }}
                className="flex-1 min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-base"
              >
                SUIVANT <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Password */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe (min. 6 caractères)"
                className="pl-12 pr-12 h-16 rounded-2xl text-xl text-center font-semibold border-2 border-gray-200 focus:border-[#006233]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-xs text-amber-600 text-center">
                Minimum 6 caractères requis
              </p>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 min-h-[56px] rounded-2xl font-bold text-base border-2"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> RETOUR
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!password || password.length < 6) { toast.error('Mot de passe trop court (min. 6 caractères)'); return }
                  setStep(4)
                }}
                className="flex-1 min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-base"
              >
                SUIVANT <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <p className="text-xs text-gray-500">Téléphone</p>
                  <p className="text-lg font-bold text-gray-900">{phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="text-xs text-gray-500">Nom</p>
                  <p className="text-lg font-bold text-gray-900">{name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <div>
                  <p className="text-xs text-gray-500">Mot de passe</p>
                  <p className="text-lg font-bold text-gray-900">{'•'.repeat(password.length)}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1 min-h-[56px] rounded-2xl font-bold text-base border-2"
              >
                <ChevronLeft className="w-5 h-5 mr-2" /> RETOUR
              </Button>
              <Button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'CRÉER MON COMPTE ✅'
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Déjà un compte ?{' '}
            <button onClick={() => setView('passenger-login')} className="text-[#006233] font-bold hover:underline">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
