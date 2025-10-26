"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JavaQuickFixProps {
  onSetInput: (input: string) => void
  onSetCode: (code: string) => void
  currentCode: string
}

export default function JavaQuickFix({ onSetInput, onSetCode, currentCode }: JavaQuickFixProps) {
  const { toast } = useToast()

  const quickFixes = [
    {
      title: "Two Integers",
      input: "5 10",
      description: "For two nextInt() calls",
    },
    {
      title: "Array Input",
      input: "3\n1 2 3",
      description: "Size + elements",
    },
    {
      title: "Multiple Lines",
      input: "5\n10\n15",
      description: "Each value on new line",
    },
    {
      title: "String Input",
      input: "Hello World",
      description: "For nextLine() call",
    },
  ]

  const handleQuickFix = (input: string, title: string) => {
    onSetInput(input)
    toast({
      title: "Input Applied",
      description: `${title} input has been set`,
    })
  }

  const fixNoInputCode = () => {
    const fixedCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read two integers
        int a = sc.nextInt();
        int b = sc.nextInt();
        
        // Calculate and print sum
        System.out.println(a + b);
        
        sc.close();
    }
}`

    onSetCode(fixedCode)
    onSetInput("5 10")

    toast({
      title: "Code Fixed",
      description: "Applied working Java template with matching input",
    })
  }

  // Check if code has Scanner calls but might have issues
  const hasScanner = currentCode.includes("Scanner") || currentCode.includes("nextInt")
  const hasNoInput = !currentCode.includes("nextInt") && !currentCode.includes("nextLine")

  if (!hasScanner) return null

  return (
    <Card className="mt-4 border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-700 text-sm">
          <Zap className="h-4 w-4" />
          Quick Input Fixes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {quickFixes.map((fix, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickFix(fix.input, fix.title)}
                className="text-xs h-auto p-2 flex flex-col items-start"
              >
                <span className="font-medium">{fix.title}</span>
                <span className="text-gray-500 text-xs">{fix.description}</span>
                <code className="text-xs bg-gray-100 px-1 rounded mt-1">{fix.input}</code>
              </Button>
            ))}
          </div>

          <div className="pt-2 border-t">
            <Button onClick={fixNoInputCode} className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
              <Zap className="h-3 w-3 mr-2" />
              Fix Code + Add Input (Complete Solution)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
