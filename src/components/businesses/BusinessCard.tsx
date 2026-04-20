"use client"

import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import type { Business } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type BusinessCardProps = {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link href={`/businesses/${business.id}`} className="group block">
      <Card className="h-full border-border/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
        <div
          className="h-1.5 rounded-t-xl"
          style={{ backgroundColor: business.color }}
        />
        <CardHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="text-lg">{business.name}</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: business.color }}
                />
                {business.color.toUpperCase()}
              </div>
            </div>
            <ArrowUpRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          {business.description || "No description yet. Add context for this business."}
        </CardContent>
      </Card>
    </Link>
  )
}
