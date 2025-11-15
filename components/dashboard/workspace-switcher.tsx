"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Check, ChevronsUpDown, Plus, Building } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Organization {
  id: string
  name: string
  slug: string
  plan: string
  role: {
    name: string
    displayName: string
  }
}

export function WorkspaceSwitcher() {
  const { data: session, update } = useSession()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrganizations()
  }, [])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/organizations")
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error("Error loading organizations:", error)
    } finally {
      setLoading(false)
    }
  }

  const switchOrganization = async (organizationId: string) => {
    try {
      const response = await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      })

      if (response.ok) {
        // Update the session to reflect the new organization
        await update()
        // Reload the page to refresh all data
        window.location.reload()
      } else {
        console.error("Failed to switch organization")
      }
    } catch (error) {
      console.error("Error switching organization:", error)
    }
  }

  const currentOrganization = session?.user?.organization

  if (loading || !currentOrganization) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <Building className="h-4 w-4 mr-2" />
        <span className="truncate">Chargement...</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <div className="flex items-center truncate">
            <Building className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{currentOrganization.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]" align="start">
        <DropdownMenuLabel>Mes organisations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onSelect={() => {
              if (org.id !== currentOrganization.id) {
                switchOrganization(org.id)
              }
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium">{org.name}</span>
                <span className="text-xs text-gray-500">
                  {org.role.displayName} · {org.plan}
                </span>
              </div>
              {org.id === currentOrganization.id && (
                <Check className="h-4 w-4 ml-2 flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            // TODO: Open create organization dialog
            alert("Fonctionnalité de création d'organisation en cours de développement")
          }}
          className="cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle organisation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
