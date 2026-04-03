'use client'

import { useState } from 'react'
import { Phone, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function PassengerLogin() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const setView = useAppStore((s) => s.setView)
  const setUser = useAppStore((s) => s.setUser)

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
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      toast.error('Entrez un numéro de téléphone valide (9 chiffres)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.needsRegistration) {
          setView('passenger-register')
          return
        }
        toast.error(data.error || 'Erreur de connexion')
        return
      }
      if (data.user.role !== 'PASSENGER') {
        toast.error('Ce compte n\'est pas un compte passager')
        return
      }
      setUser(data.user, data.vehicle)
      toast.success(`Bienvenue ${data.user.name} !`)
      setView('passenger-dashboard')
    } catch {
      toast.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#006233]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-[#006233]">Connexion Passager</h2>
          <p className="text-sm text-gray-500 mt-1">Entrez votre téléphone et mot de passe</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="tel"
              inputMode="numeric"
              placeholder="77 123 45 67"
              className="pl-12 h-16 rounded-2xl text-2xl text-center font-semibold tracking-wider border-2 border-gray-200 focus:border-[#006233]"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={13}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              'SE CONNECTER'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Pas de compte ?{' '}
            <button
              onClick={() => setView('passenger-register')}
              className="text-[#006233] font-bold hover:underline"
            >
              S&apos;inscrire
            </button>
          </p>
        </div>

        <div className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-200">
          <p className="text-xs text-amber-700 text-center">
            📱 Compte test : <strong>78 123 45 67</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
