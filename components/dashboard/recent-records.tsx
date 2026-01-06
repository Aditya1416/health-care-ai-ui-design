"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RecentRecords() {
  const records = [
    {
      id: 1,
      type: "Lab Results",
      date: "2024-01-15",
      doctor: "Dr. Smith",
      status: "Complete",
    },
    {
      id: 2,
      type: "X-Ray",
      date: "2024-01-12",
      doctor: "Dr. Johnson",
      status: "Complete",
    },
    {
      id: 3,
      type: "Blood Work",
      date: "2024-01-10",
      doctor: "Dr. Williams",
      status: "Pending",
    },
  ]

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Recent Medical Records</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium text-foreground">{record.type}</p>
                <p className="text-sm text-muted-foreground">{record.doctor}</p>
                <p className="text-xs text-muted-foreground">{record.date}</p>
              </div>
              <Badge variant={record.status === "Complete" ? "default" : "secondary"}>{record.status}</Badge>
            </div>
          ))}
        </div>
        <Link href="/dashboard/records">
          <Button variant="outline" className="w-full mt-4 bg-transparent">
            View All Records
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
