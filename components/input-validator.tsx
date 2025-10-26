"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, Lightbulb } from "lucide-react"

interface InputValidatorProps {
  code: string
  input: string
  language: string
}

export default function InputValidator({ code, input, language }: InputValidatorProps) {
  if (language !== "java") return null

  const analyzeJavaInput = () => {
    const scannerCalls = code.match(/\.nextInt$$$$|\.nextLine$$$$|\.next$$$$|\.nextDouble$$$$/g) || []
    const inputLines = input.trim().split("\n")
    const inputValues = input.trim().split(/\s+/)

    const analysis = {
      scannerCallsCount: scannerCalls.length,
      inputLinesCount: inputLines.length,
      inputValuesCount: inputValues.filter((v) => v.length > 0).length,
      hasInput: input.trim().length > 0,
      scannerCalls,
      suggestions: [] as string[],
    }

    // Generate suggestions
    if (!analysis.hasInput && analysis.scannerCallsCount > 0) {
      analysis.suggestions.push("❌ Your code expects input but none provided")
    }

    if (analysis.hasInput && analysis.scannerCallsCount === 0) {
      analysis.suggestions.push("⚠️ You provided input but code doesn't read any")
    }

    if (analysis.scannerCallsCount > analysis.inputValuesCount) {
      analysis.suggestions.push(
        `❌ Code expects ${analysis.scannerCallsCount} values, but only ${analysis.inputValuesCount} provided`,
      )
    }

    if (analysis.scannerCallsCount === analysis.inputValuesCount && analysis.hasInput) {
      analysis.suggestions.push("✅ Input count matches Scanner calls")
    }

    // Specific suggestions based on Scanner methods
    const nextIntCount = (code.match(/\.nextInt$$$$/g) || []).length
    if (nextIntCount > 0) {
      if (nextIntCount === 2) {
        analysis.suggestions.push(`💡 For ${nextIntCount} integers, try: "5 10" or "5\\n10"`)
      } else if (nextIntCount > 2) {
        analysis.suggestions.push(
          `💡 For ${nextIntCount} integers, try: "${Array.from({ length: nextIntCount }, (_, i) => i + 1).join(" ")}"`,
        )
      }
    }

    return analysis
  }

  const analysis = analyzeJavaInput()

  if (analysis.scannerCallsCount === 0) return null

  return (
    <Card className="mt-4 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700 text-sm">
          <Lightbulb className="h-4 w-4" />
          Input Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-600">Scanner calls found:</p>
              <Badge variant="outline">{analysis.scannerCallsCount}</Badge>
            </div>
            <div>
              <p className="text-gray-600">Input values provided:</p>
              <Badge variant="outline">{analysis.inputValuesCount}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                {suggestion.startsWith("✅") ? (
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                ) : suggestion.startsWith("❌") ? (
                  <XCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                )}
                <span
                  className={
                    suggestion.startsWith("✅")
                      ? "text-green-700"
                      : suggestion.startsWith("❌")
                        ? "text-red-700"
                        : "text-yellow-700"
                  }
                >
                  {suggestion}
                </span>
              </div>
            ))}
          </div>

          {analysis.scannerCalls.length > 0 && (
            <div className="mt-3 p-2 bg-white rounded border">
              <p className="text-xs text-gray-600 mb-1">Scanner methods in your code:</p>
              <div className="flex flex-wrap gap-1">
                {analysis.scannerCalls.map((call, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {call}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
