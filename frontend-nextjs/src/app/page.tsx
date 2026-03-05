'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://tcjrhk37ew.ufs.sh/f/CrHVRHXsIQGlRbxI7RL8gSUGMWYN1rHIDsZAEqb0PO4uBxif" type="video/mp4" />
      </video>
      
      {/* Dark Tint Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Hero Section */}
      <section className="relative z-20 h-full flex items-center justify-center px-6">{/* Removed background patterns - now using video */}

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Hero Header */}
          <div className="flex items-center justify-center mb-12">
            <h1 className="text-display text-6xl md:text-7xl font-bold text-white tracking-tight leading-tight text-center">
              LoadShed
              <br />
              <span className="text-amber-500">Predictor</span>
            </h1>
          </div>
          
          <p className="text-2xl md:text-3xl text-white/90 mb-6 font-medium">
            AI-powered load shedding predictions for South Africa
          </p>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed">
            Get accurate 6-hour ahead predictions using advanced machine learning. 
            Reliable, fast, and intelligent forecasting to help you plan better and stay prepared.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-7 py-3 bg-amber-500 text-white font-semibold rounded hover:bg-amber-600 transition-colors duration-200"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => router.push('/predict')}
                  className="px-7 py-3 border-2 border-white/40 bg-white/20 text-white font-semibold rounded hover:bg-white/30 transition-colors duration-200 flex items-center gap-3"
                >
                  New Prediction
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-7 py-3 bg-amber-500 text-white font-semibold rounded hover:bg-amber-600 transition-colors duration-200"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-7 py-3 border-2 border-white/40 bg-white/20 text-white font-semibold rounded hover:bg-white/30 transition-colors duration-200"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
