'use client'

import { useState, useEffect, useRef } from 'react'
import { Phone, Lock, Loader2, Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react'
import { useAppStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1)
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const goBack = useAppStore((s) => s.goBack)

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true)
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const startCountdown = () => {
    setCountdown(60)
    setCanResend(false)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`
    if (digits.length <= 9) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 9)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = otp.slice(0, index) + value + otp.slice(index + 1)
    setOtp(newOtp)
    // Auto-focus next input
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 9) {
      toast.error('Entrez un numéro de téléphone valide (9 chiffres)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      })
      const data = await res.json()
      if (data.otp) {
        toast.info(`Code de test : ${data.otp}`)
      }
      toast.success('Code envoyé par SMS')
      setStep(2)
      startCountdown()
      // Focus first OTP input
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch {
      toast.error('Erreur lors de l\'envoi du code')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits }),
      })
      const data = await res.json()
      if (data.otp) {
        toast.info(`Code de test : ${data.otp}`)
      }
      toast.success('Nouveau code envoyé par SMS')
      setOtp('')
      startCountdown()
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch {
      toast.error('Erreur lors de l\'envoi du code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    const digits = phone.replace(/\D/g, '')
    if (otp.length !== 4) {
      toast.error('Entrez le code à 4 chiffres')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, otp, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur')
        return
      }
      toast.success('Mot de passe modifié avec succès !')
      goBack()
    } catch {
      toast.error('Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#006233]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📱</span>
          </div>
          <h2 className="text-2xl font-bold text-[#006233]">Mot de passe oublié</h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1
              ? 'Entrez votre numéro pour recevoir un code'
              : 'Entrez le code reçu par SMS'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-10 h-2 rounded-full transition-colors duration-300 ${step === 1 ? 'bg-[#006233]' : 'bg-[#006233]'}`} />
          <div className={`w-10 h-2 rounded-full transition-colors duration-300 ${step === 2 ? 'bg-[#006233]' : 'bg-gray-200'}`} />
        </div>

        {/* Back button */}
        <button
          type="button"
          onClick={() => {
            if (step === 2) {
              setStep(1)
              setOtp('')
            } else {
              goBack()
            }
          }}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#006233] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 2 ? 'Retour' : 'Retour'}
        </button>

        {step === 1 && (
          <div className="space-y-6">
            {/* Phone input */}
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

            <Button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'ENVOYER LE CODE'
              )}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* OTP Input - 4 large centered digits */}
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <div className="pl-12 flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ''}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-14 h-16 text-center text-3xl font-bold rounded-2xl border-2 border-gray-200 focus:border-[#006233] outline-none transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Resend timer */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-[#006233] font-semibold hover:underline"
                >
                  Renvoyer le code
                </button>
              ) : (
                <span className="text-sm text-gray-400">
                  Renvoyer dans {countdown}s
                </span>
              )}
            </div>

            {/* New password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe"
                className="pl-12 pr-12 h-16 rounded-2xl text-xl text-center font-semibold border-2 border-gray-200 focus:border-[#006233]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmer le mot de passe"
                className="pl-12 pr-12 h-16 rounded-2xl text-xl text-center font-semibold border-2 border-gray-200 focus:border-[#006233]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full min-h-[56px] rounded-2xl bg-[#006233] hover:bg-[#006233]/90 text-white font-bold text-lg shadow-lg"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                'RÉINITIALISER'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
