"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { OnboardingDialog } from "@/components/dashboard/onboarding-dialog"

interface DashboardWrapperProps {
  children: React.ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const { data: session, status } = useSession()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Check if onboarding was completed
      const onboardingComplete = localStorage.getItem("trajectory_onboarding_complete")
      
      if (!onboardingComplete) {
        // Check if user has any data (clients or invoices)
        checkUserData()
      } else {
        setCheckingOnboarding(false)
      }
    } else if (status !== "loading") {
      setCheckingOnboarding(false)
    }
  }, [status, session])

  const checkUserData = async () => {
    try {
      // Check if organization has any clients
      const clientsResponse = await fetch("/api/clients")
      if (clientsResponse.ok) {
        const data = await clientsResponse.json()
        if (data.clients && data.clients.length > 0) {
          // User already has data, skip onboarding
          localStorage.setItem("trajectory_onboarding_complete", "true")
          setCheckingOnboarding(false)
          return
        }
      }
      
      // No data found, show onboarding
      setShowOnboarding(true)
    } catch (error) {
      console.error("Error checking user data:", error)
    } finally {
      setCheckingOnboarding(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  if (checkingOnboarding) {
    return null // Or a subtle loading indicator
  }

  return (
    <>
      {children}
      <OnboardingDialog 
        open={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
    </>
  )
}
