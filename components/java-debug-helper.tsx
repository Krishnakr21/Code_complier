"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JavaDebugHelperProps {
  onLoadCode: (code: string, input: string) => void
}

export default function JavaDebugHelper({ onLoadCode }: JavaDebugHelperProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  const wrongCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        System.out.println("enter value" + a);  // WRONG!
        int b = sc.nextInt();
        System.out.println("enter value" + b);  // WRONG!
        int c = a + b;
        System.out.println(c);
        sc.close();
    }
}`

  const correctCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input silently (competitive programming style)
        int a = sc.nextInt();
        int b = sc.nextInt();
        
        // Calculate and print only the result
        int sum = a + b;
        System.out.println(sum);
        
        sc.close();
    }
}`

  const interactiveCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Print prompts BEFORE reading (interactive style)
        System.out.print("Enter first number: ");
        int a = sc.nextInt();
        
        System.out.print("Enter second number: ");
        int b = sc.nextInt();
        
        System.out.println("Sum: " + (a + b));
        sc.close();
    }
}`

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />❌ Your Original Code (Wrong)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">{wrongCode}</pre>

            <div className="bg-red-100 p-3 rounded">
              <p className="text-sm text-red-800 font-medium">Why this produces "5enter value55enter value510":</p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                <li>Scanner reads "5" immediately when nextInt() is called</li>
                <li>Then it prints "enter value5" (5 + "enter value5")</li>
                <li>Scanner reads "10" for the second nextInt()</li>
                <li>Then it prints "enter value10" (10 + "enter value10")</li>
                <li>Finally prints the sum "15"</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(wrongCode)}>
                <Copy className="h-3 w-3 mr-1" />
                Copy Wrong Code
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onLoadCode(wrongCode, "5 10")}>
                Load & Test Wrong Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />✅ Correct Code (Competitive Programming Style)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">{correctCode}</pre>

            <div className="bg-green-100 p-3 rounded">
              <p className="text-sm text-green-800 font-medium">Why this works correctly:</p>
              <ul className="list-disc list-inside text-sm text-green-700 mt-2 space-y-1">
                <li>Reads input silently without prompts</li>
                <li>Only prints the final result</li>
                <li>Standard format for competitive programming</li>
                <li>Clean output: just "15"</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(correctCode)}>
                <Copy className="h-3 w-3 mr-1" />
                Copy Correct Code
              </Button>
              <Button variant="default" size="sm" onClick={() => onLoadCode(correctCode, "5 10")}>
                Load & Test Correct Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <AlertTriangle className="h-5 w-5" />🔧 Interactive Version (If You Need Prompts)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">{interactiveCode}</pre>

            <div className="bg-blue-100 p-3 rounded">
              <p className="text-sm text-blue-800 font-medium">When to use this style:</p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Interactive programs where user needs guidance</li>
                <li>Print prompts BEFORE reading input</li>
                <li>Use System.out.print() (no newline) for prompts</li>
                <li>Good for learning, not for competitive programming</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(interactiveCode)}>
                <Copy className="h-3 w-3 mr-1" />
                Copy Interactive Code
              </Button>
              <Button variant="default" size="sm" onClick={() => onLoadCode(interactiveCode, "5\n10")}>
                Load & Test Interactive Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />💡 Key Learning Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>
              <strong>1. Order Matters:</strong> Scanner reads input immediately when called
            </p>
            <p>
              <strong>2. Competitive Programming:</strong> Usually no prompts, just clean input/output
            </p>
            <p>
              <strong>3. Interactive Programs:</strong> Print prompts BEFORE reading input
            </p>
            <p>
              <strong>4. Your Error:</strong> You printed messages AFTER reading, causing mixed output
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
