"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function Pricing() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
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

  const plans = [
    {
      name: "Starter",
      price: "0€",
      period: "Gratuit à vie",
      description: "Parfait pour démarrer et tester la plateforme",
      features: [
        "5 clients maximum",
        "10 factures par mois",
        "Tableau de bord basique",
        "Support par email",
        "Exports PDF",
      ],
      cta: "Commencer gratuitement",
      href: "/inscription?plan=starter",
      popular: false,
    },
    {
      name: "Pro",
      price: "29€",
      period: "par mois",
      description: "Pour les freelances et petites entreprises",
      features: [
        "Clients illimités",
        "Factures illimitées",
        "Tous les modules",
        "Support prioritaire",
        "Exports avancés (Excel, CSV)",
        "Facturation récurrente",
        "Prévisions et scénarios",
        "Intégrations bancaires",
      ],
      cta: "Essai gratuit 14 jours",
      href: "/inscription?plan=pro",
      popular: true,
    },
    {
      name: "Business",
      price: "99€",
      period: "par mois",
      description: "Pour les équipes et entreprises en croissance",
      features: [
        "Tout du plan Pro",
        "Utilisateurs multiples (jusqu'à 10)",
        "Support dédié",
        "Formations personnalisées",
        "API & webhooks",
        "Rapports personnalisés",
        "Gestion des rôles",
        "SLA garanti",
      ],
      cta: "Contactez-nous",
      href: "/contact?plan=business",
      popular: false,
    },
  ]

  return (
    <section
      ref={sectionRef}
      id="tarifs"
      className="py-20 md:py-32 bg-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Un prix{" "}
            <span className="text-primary">transparent</span> pour chaque besoin
          </h2>
          <p className="text-xl text-gray-600">
            Commencez gratuitement et évoluez selon votre croissance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={plan.name}
              className={`relative transition-all duration-500 hover:scale-105 ${
                plan.popular
                  ? "border-primary shadow-xl scale-105"
                  : "border-gray-200"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Plus populaire
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.price !== "0€" && (
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  )}
                  {plan.price === "0€" && (
                    <div className="text-gray-600 text-sm mt-1">{plan.period}</div>
                  )}
                </div>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.href} className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="text-center text-gray-600 mt-12">
          Tous les tarifs sont HT. TVA applicable selon votre pays.
        </p>
      </div>
    </section>
  )
}
