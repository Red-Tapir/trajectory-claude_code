"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, FileText, Users, TrendingUp } from "lucide-react"

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-primary-50/30 to-white"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Pilotez votre croissance financière,{" "}
            <span className="text-primary">simplement</span>.
          </h1>

          {/* Subheadline */}
          <p
            className={`text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Planifiez, facturez, analysez — tout depuis un seul cockpit.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <Link href="/inscription">
              <Button size="lg" className="text-lg px-8 py-6 group">
                Inscription gratuite
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Découvrir la plateforme
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {[
              {
                icon: BarChart3,
                label: "Tableaux de bord",
              },
              {
                icon: TrendingUp,
                label: "Prévisions",
              },
              {
                icon: FileText,
                label: "Facturation",
              },
              {
                icon: Users,
                label: "CRM",
              },
            ].map((feature, index) => (
              <div
                key={feature.label}
                className="flex flex-col items-center p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary-100 hover:border-primary-300 hover:shadow-md transition-all group"
                style={{
                  transitionDelay: `${300 + index * 100}ms`,
                }}
              >
                <feature.icon className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
