"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  FileText,
  BarChart3,
  Target,
  Zap,
  Shield,
} from "lucide-react"

export function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger the card animations
            features.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards((prev) => [...prev, index])
              }, index * 150)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: LayoutDashboard,
      title: "Tableau de bord",
      description:
        "Visualisez vos KPIs, prévisions et alertes en temps réel. Gardez le contrôle de votre activité d'un seul coup d'œil.",
      color: "bg-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Planification financière",
      description:
        "Créez des budgets, simulez des scénarios et suivez vos objectifs vs résultats pour anticiper votre croissance.",
      color: "bg-primary",
    },
    {
      icon: Users,
      title: "CRM intégré",
      description:
        "Gérez vos clients, suivez votre pipeline commercial et reliez chaque facture à son client pour une vue complète.",
      color: "bg-purple-500",
    },
    {
      icon: FileText,
      title: "Facturation simplifiée",
      description:
        "Créez et envoyez des factures professionnelles conformes à la réglementation française (e-invoicing 2026).",
      color: "bg-orange-500",
    },
    {
      icon: BarChart3,
      title: "Rapports & analyses",
      description:
        "Exportez des rapports détaillés, visualisez vos performances avec des graphiques clairs et pertinents.",
      color: "bg-green-500",
    },
    {
      icon: Target,
      title: "Objectifs & prévisions",
      description:
        "Définissez vos objectifs et suivez leur réalisation avec des prévisions basées sur vos données historiques.",
      color: "bg-red-500",
    },
    {
      icon: Zap,
      title: "Automatisation",
      description:
        "Gagnez du temps avec des rappels automatiques, des factures récurrentes et des calculs en temps réel.",
      color: "bg-yellow-500",
    },
    {
      icon: Shield,
      title: "Sécurité & conformité",
      description:
        "Vos données sont protégées et hébergées en France. Conformité RGPD et normes de facturation française.",
      color: "bg-indigo-500",
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="fonctionnalites"
      className="py-20 md:py-32 bg-gray-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Tout ce dont vous avez besoin pour{" "}
            <span className="text-primary">réussir</span>
          </h2>
          <p className="text-xl text-gray-600">
            Une plateforme complète pour piloter votre entreprise, de la
            planification à la facturation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`transition-all duration-500 hover:scale-105 cursor-pointer ${
                visibleCards.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
