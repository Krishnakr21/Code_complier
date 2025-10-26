"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JavaInputExplanationProps {
  onLoadCode: (code: string, input: string) => void
}

export default function JavaInputExplanation({ onLoadCode }: JavaInputExplanationProps) {
  const { toast } = useToast()

  const interactiveCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Interactive style - prompts appear all at once in online compilers
        System.out.print("Enter first number: ");
        int a = sc.nextInt();
        
        System.out.print("Enter second number: ");
        int b = sc.nextInt();
        
        System.out.println("Sum: " + (a + b));
        sc.close();
    }
}`

  const competitiveCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Competitive programming style - clean input/output
        int a = sc.nextInt();
        int b = sc.nextInt();
        
        System.out.println(a + b);
        sc.close();
    }
}`

  const stepByStepCode = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Step-by-step with confirmation
        System.out.print("Enter first number: ");
        int a = sc.nextInt();
        System.out.println("You entered: " + a);
        
        System.out.print("Enter second number: ");
        int b = sc.nextInt();
        System.out.println("You entered: " + b);
        
        int sum = a + b;
        System.out.println("Sum: " + sum);
        
        sc.close();
    }
}`

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Info className="h-5 w-5" />
            Why Your Output Looks Like This
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium mb-2">Your Current Output:</h4>
              <pre className="text-sm bg-gray-100 p-2 rounded">Enter first number: Enter second number: Sum: 15</pre>
            </div>

            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>This is actually CORRECT!</strong> Here's what happens:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Program prints "Enter first number: " (no newline)</li>
                <li>Program waits for input, you type "5"</li>
                <li>Program prints "Enter second number: " (no newline)</li>
                <li>Program waits for input, you type "10"</li>
                <li>Program prints "Sum: 15" (with newline)</li>
              </ol>
              <p className="mt-3">
                <strong>In online compilers:</strong> All prompts appear together because the system processes
                everything at once, but your input is still being read correctly!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Your Current Code (Working Correctly)
              </CardTitle>
              <Badge className="bg-green-100 text-green-800">✅ Correct</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">{interactiveCode}</pre>

              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="text-sm text-green-800 font-medium">Expected Behavior:</p>
                <div className="mt-2 space-y-1 text-sm text-green-700">
                  <p>
                    <strong>Input:</strong> <code>5 10</code> (or <code>5\n10</code>)
                  </p>
                  <p>
                    <strong>Output:</strong> <code>Enter first number: Enter second number: Sum: 15</code>
                  </p>
                  <p className="text-xs mt-2">
                    💡 The prompts appear together, but Scanner reads your input correctly in sequence.
                  </p>
                </div>
              </div>

              <Button onClick={() => onLoadCode(interactiveCode, "5\n10")} className="w-full">
                Test This Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Competitive Programming Style
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-800">Recommended</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">{competitiveCode}</pre>

              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">Clean Output:</p>
                <div className="mt-2 space-y-1 text-sm text-blue-700">
                  <p>
                    <strong>Input:</strong> <code>5 10</code>
                  </p>
                  <p>
                    <strong>Output:</strong> <code>15</code>
                  </p>
                  <p className="text-xs mt-2">💡 No prompts, just clean input/output for competitions.</p>
                </div>
              </div>

              <Button onClick={() => onLoadCode(competitiveCode, "5 10")} className="w-full">
                Test Clean Version
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Step-by-Step Confirmation
              </CardTitle>
              <Badge className="bg-purple-100 text-purple-800">Verbose</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">{stepByStepCode}</pre>

              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <p className="text-sm text-purple-800 font-medium">Detailed Output:</p>
                <div className="mt-2 space-y-1 text-sm text-purple-700">
                  <p>
                    <strong>Input:</strong> <code>5\n10</code>
                  </p>
                  <p>
                    <strong>Output:</strong>
                  </p>
                  <pre className="text-xs bg-white p-2 rounded mt-1">
                    Enter first number: You entered: 5{"\n"}
                    Enter second number: You entered: 10{"\n"}
                    Sum: 15
                  </pre>
                  <p className="text-xs mt-2">💡 Shows confirmation of each input for debugging.</p>
                </div>
              </div>

              <Button onClick={() => onLoadCode(stepByStepCode, "5\n10")} className="w-full">
                Test Verbose Version
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <AlertTriangle className="h-5 w-5" />
            Key Understanding Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-800 space-y-3">
            <div>
              <p className="font-medium">1. Online Compiler Behavior:</p>
              <p>
                Online compilers process all output at once, so prompts appear together. This is normal and doesn't mean
                your code is wrong.
              </p>
            </div>

            <div>
              <p className="font-medium">2. Scanner Still Works:</p>
              <p>
                Even though prompts appear together, Scanner.nextInt() still waits for and reads your input in the
                correct order.
              </p>
            </div>

            <div>
              <p className="font-medium">3. Input Format:</p>
              <p>
                You can use either <code>"5 10"</code> (space-separated) or <code>"5\n10"</code> (newline-separated) for
                two integers.
              </p>
            </div>

            <div>
              <p className="font-medium">4. For Competitions:</p>
              <p>Usually no prompts are needed - just read input silently and print the result.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
