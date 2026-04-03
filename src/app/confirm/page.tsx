import { Suspense } from 'react'
import PackageConfirmation from '@/components/PackageConfirmation'

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#006233] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    }>
      <PackageConfirmation />
    </Suspense>
  )
}
