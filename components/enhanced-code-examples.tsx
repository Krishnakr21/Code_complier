"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Play, CheckCircle, XCircle, Bug, HelpCircle } from "lucide-react"
import { CODE_TEMPLATES, type CodeTemplate, type TestCase } from "@/lib/test-cases"
import { executeCode } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import JavaDebugHelper from "@/components/java-debug-helper"
import JavaInputExplanation from "@/components/java-input-explanation"

interface EnhancedCodeExamplesProps {
  onLoadExample: (code: string, language: string, input?: string) => void
}

export default function EnhancedCodeExamples({ onLoadExample }: EnhancedCodeExamplesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null)
  const [testResults, setTestResults] = useState<{ [key: number]: boolean | null }>({})
  const [isRunningTests, setIsRunningTests] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  const runTestCase = async (template: CodeTemplate, testCase: TestCase, index: number) => {
    setIsRunningTests(true)
    try {
      const result = await executeCode(template.language, template.code, testCase.input)
      const passed = result.success && result.output?.trim() === testCase.expectedOutput.trim()

      setTestResults((prev) => ({ ...prev, [index]: passed }))

      if (!passed) {
        toast({
          title: "Test Failed",
          description: `Expected: ${testCase.expectedOutput}, Got: ${result.output || result.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [index]: false }))
      toast({
        title: "Test Error",
        description: "Failed to run test case",
        variant: "destructive",
      })
    } finally {
      setIsRunningTests(false)
    }
  }

  const runAllTests = async (template: CodeTemplate) => {
    setIsRunningTests(true)
    setTestResults({})

    for (let i = 0; i < template.testCases.length; i++) {
      await runTestCase(template, template.testCases[i], i)
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunningTests(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const categories = [...new Set(CODE_TEMPLATES.map((t) => t.category))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">DSA Code Templates & Test Cases</h3>
        <Badge variant="outline">{CODE_TEMPLATES.length} Templates</Badge>
      </div>

      <Tabs defaultValue="Input Help" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="Input Help">
            <HelpCircle className="h-4 w-4 mr-1" />
            Input Help
          </TabsTrigger>
          <TabsTrigger value="Common Mistakes">
            <Bug className="h-4 w-4 mr-1" />
            Debug
          </TabsTrigger>
          {categories.slice(0, 4).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="Input Help" className="space-y-4">
          <JavaInputExplanation onLoadCode={(code, input) => onLoadExample(code, "java", input)} />
        </TabsContent>

        <TabsContent value="Common Mistakes" className="space-y-4">
          <JavaDebugHelper onLoadCode={(code, input) => onLoadExample(code, "java", input)} />
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4">
              {CODE_TEMPLATES.filter((t) => t.category === category).map((template, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{template.title}</CardTitle>
                        <Badge variant="outline">{template.language.toUpperCase()}</Badge>
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(template.code)}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onLoadExample(template.code, template.language, template.testCases[0]?.input)}
                        >
                          Load Template
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Code Preview */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Code Preview:</h4>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto max-h-32">{template.code}</pre>
                      </div>

                      {/* Test Cases */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium">Test Cases:</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runAllTests(template)}
                            disabled={isRunningTests}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            {isRunningTests ? "Running..." : "Run All Tests"}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {template.testCases.map((testCase, testIndex) => (
                            <div key={testIndex} className="border rounded p-2 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{testCase.description}</span>
                                <div className="flex items-center gap-2">
                                  {testResults[testIndex] === true && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  {testResults[testIndex] === false && <XCircle className="h-4 w-4 text-red-500" />}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => runTestCase(template, testCase, testIndex)}
                                    disabled={isRunningTests}
                                  >
                                    Test
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <span className="text-gray-500">Input:</span>
                                  <pre className="bg-blue-50 p-1 rounded mt-1">{testCase.input}</pre>
                                </div>
                                <div>
                                  <span className="text-gray-500">Expected:</span>
                                  <pre className="bg-green-50 p-1 rounded mt-1">{testCase.expectedOutput}</pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
