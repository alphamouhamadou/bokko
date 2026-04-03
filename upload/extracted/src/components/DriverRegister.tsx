'use client'

import { useState, useRef, useEffect } from 'react'
import { Phone, User, Car, Lock, Eye, EyeOff, Link, Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const BRANDS = ['Toyota', 'Mercedes', 'Hyundai', 'Renault', 'Peugeot', 'Dacia', 'Autre']
const COLORS = ['Blanc', 'Noir', 'Gris', 'Rouge', 'Bleu', 'Autre']

export default function DriverRegister() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [brand, setBrand] = useState('')
  const [color, setColor] = useState('')
  const [capacity, setCapacity] = useState<number | null>(null)
  const [waveLink, setWaveLink] = useState('')
  const [loading, setLoading] = useState(false)
  const setView = useAppStore((s) => s.setView)
  const setUser = useAppStore((s) => s.setUser)
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 1) nameInputRef.current?.focus()
  }, [step])

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 9)}`
  }

  const handleRegister = async (skipWave = false) => {
    if (!name || name.length < 2) {
      toast.error('Entrez votre nom')
      return
    }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      toast.error('Numéro de téléphone invalide')
      return
    }
    if (!password || password.length < 6) {
      toast.error('Mot de passe trop court (min. 6 caractères)')
      return
    }
    if (!brand || !color || !capacity) {
      toast.error('Remplissez les infos du véhicule')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: digits,
          name,
          password,
          role: 'DRIVER',
          waveBusinessLink: skipWave ? null : (waveLink.trim() ? waveLink.trim() : null),
          vehicle: { brand, model: '', color, plateNumber: '', capacity: String(capacity) },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de l\'inscription')
        return
      }
      setUser(data.user)
      toast.success('Inscription réussie !')
      setView('driver-dashboard')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const stepEmojis = ['👤', '🚗', '💰']
  const stepLabels = ['Vous', 'Véhicule', 'Paiement']

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${
                  s === step
                    ? 'bg-[#FFD700] text-[#006233] scale-110 shadow-lg'
                    : s < step
                    ? 'bg-[#FFD700]/20 text-[#006233]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s < step ? '✓' : stepEmojis[s - 1]}
              </div>
              <span className={`text-[10px] font-medium ${s === step ? 'text-[#006233]' : 'text-gray-400'}`}>
                {stepLabels[s - 1]}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Name + Phone + Password */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-[#006233]">👤 Vos informations</h2>
            </div>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                ref={nameInputRef}
                placeholder="Votre prénom"
                className="pl-12 h-14 rounded-2xl text-lg font-semibold border-2 border-gray-200 focus:border-[#FFD700]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="77 123 45 67"
                className="pl-12 h-14 rounded-2xl text-lg font-semibold tracking-wider border-2 border-gray-200 focus:border-[#FFD700]"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                maxLength={13}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe (min. 6 caractères)"
                className="pl-12 pr-12 h-14 rounded-2xl text-lg font-semibold border-2 border-gray-200 focus:border-[#FFD700]"
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
            <Button
              type="button"
              onClick={() => {
                if (!name) { toast.error('Entrez votre nom'); return }
                if (phone.replace(/\D/g, '').length < 9) { toast.error('Entrez 9 chiffres'); return }
                if (!password || password.length < 6) { toast.error('Mot de passe trop court (min. 6 caractères)'); return }
                setStep(2)
              }}
              className="w-full min-h-[56px] rounded-2xl bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#006233] font-bold text-lg"
            >
              SUIVANT <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Vehicle */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-[#006233]">🚗 Votre véhicule</h2>
            </div>

            {/* Brand */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Marque</p>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="w-full h-14 rounded-2xl text-base font-semibold border-2 border-gray-200">
                  <SelectValue placeholder="Choisir la marque" />
                </SelectTrigger>
                <SelectContent>
                  {BRANDS.map((b) => (
                    <SelectItem key={b} value={b} className="text-base">{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Couleur</p>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger className="w-full h-14 rounded-2xl text-base font-semibold border-2 border-gray-200">
                  <SelectValue placeholder="Choisir la couleur" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => (
                    <SelectItem key={c} value={c} className="text-base">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Places (passagers)</p>
              <div className="grid grid-cols-4 gap-2">
                {[4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCapacity(n)}
                    className={`h-14 rounded-2xl text-xl font-bold transition-all ${
                      capacity === n
                        ? 'bg-[#006233] text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
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
                  if (!brand || !color || !capacity) { toast.error('Remplissez tout'); return }
                  setStep(3)
                }}
                className="flex-1 min-h-[56px] rounded-2xl bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#006233] font-bold text-base"
              >
                SUIVANT <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment (Wave Business Link) */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-[#006233]">💰 Paiement</h2>
              <p className="text-sm text-gray-500 mt-1">Votre lien Wave Business (optionnel)</p>
            </div>

            <div className="bg-gradient-to-r from-[#1DC3E3]/10 to-[#0EA5C9]/10 rounded-2xl p-4 text-center">
              <span className="text-3xl">📲</span>
              <p className="text-sm font-bold text-[#1DC3E3] mt-2">Wave Business</p>
              <p className="text-xs text-gray-500 mt-1">
                Collez votre lien de paiement Wave Business pour recevoir les paiements des passagers
              </p>
            </div>

            <div className="relative">
              <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="url"
                placeholder="https://pay.wave.com/votre-lien"
                className="pl-12 h-14 rounded-2xl text-base font-medium border-2 border-gray-200 focus:border-[#1DC3E3]"
                value={waveLink}
                onChange={(e) => setWaveLink(e.target.value)}
              />
            </div>

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
                onClick={() => handleRegister(false)}
                disabled={loading}
                className="flex-1 min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-base"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'CRÉER ✅'
                )}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => handleRegister(true)}
              disabled={loading}
              className="w-full min-h-[48px] rounded-2xl text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              ⏭️ Plus tard
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Déjà un compte ?{' '}
            <button onClick={() => setView('driver-login')} className="text-[#006233] font-bold hover:underline">
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
