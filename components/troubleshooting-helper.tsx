"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Terminal, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function TroubleshootingHelper() {
  const { toast } = useToast()
  const [checks, setChecks] = useState<{ [key: string]: boolean | null }>({})

  const runSystemCheck = async () => {
    setChecks({})

    // Check API connectivity
    try {
      const response = await fetch("/api/auth/session")
      setChecks((prev) => ({ ...prev, api: response.ok }))
    } catch {
      setChecks((prev) => ({ ...prev, api: false }))
    }

    // Check MongoDB connectivity (through API)
    try {
      const response = await fetch("/api/user/profile")
      setChecks((prev) => ({ ...prev, mongodb: response.status !== 500 }))
    } catch {
      setChecks((prev) => ({ ...prev, mongodb: false }))
    }

    // Check code execution
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "javascript",
          code: 'console.log("test")',
          input: "",
        }),
      })
      const result = await response.json()
      setChecks((prev) => ({ ...prev, execution: result.success }))
    } catch {
      setChecks((prev) => ({ ...prev, execution: false }))
    }

    toast({
      title: "System Check Complete",
      description: "Check the results below",
    })
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <RefreshCw className="h-4 w-4 text-gray-400" />
    return status ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === null) return <Badge variant="secondary">Not Tested</Badge>
    return status ? (
      <Badge className="bg-green-100 text-green-800">Working</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Diagnostics
          </CardTitle>
          <Button onClick={runSystemCheck} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Check
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="font-medium">API Connectivity</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(checks.api)}
                {getStatusBadge(checks.api)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="font-medium">MongoDB Connection</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(checks.mongodb)}
                {getStatusBadge(checks.mongodb)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                <span className="font-medium">Code Execution</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(checks.execution)}
                {getStatusBadge(checks.execution)}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800 mb-2">Quick Fixes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• If API fails: Check if server is running on port 3000</li>
              <li>• If MongoDB fails: Verify MONGODB_URI in .env.local</li>
              <li>• If execution fails: Check internet connection</li>
              <li>• Try refreshing the page or clearing browser cache</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
