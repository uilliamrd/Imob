"use client"

import { useEffect } from "react"

export function ViewTracker({ propertyId, orgId }: { propertyId: string; orgId?: string }) {
  useEffect(() => {
    fetch("/api/events/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: propertyId, org_id: orgId }),
    }).catch(() => {})
  }, [propertyId])
  return null
}
