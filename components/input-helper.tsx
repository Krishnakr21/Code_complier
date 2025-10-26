"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InputExample {
  title: string
  code: string
  input: string
  explanation: string
  language: string
}

const INPUT_EXAMPLES: InputExample[] = [
  {
    title: "Two Integers",
    language: "java",
    code: `Scanner sc = new Scanner(System.in);
int a = sc.nextInt();
int b = sc.nextInt();
System.out.println(a + b);`,
    input: "5 10",
    explanation: "Two integers separated by space. Scanner reads them one by one.",
  },
  {
    title: "Two Integers (Newline)",
    language: "java",
    code: `Scanner sc = new Scanner(System.in);
int a = sc.nextInt();
int b = sc.nextInt();
System.out.println(a + b);`,
    input: "5\n10",
    explanation: "Two integers on separate lines. Both formats work with nextInt().",
  },
  {
    title: "Array Input",
    language: "java",
    code: `Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
int[] arr = new int[n];
for (int i = 0; i < n; i++) {
    arr[i] = sc.nextInt();
}`,
    input: "3\n1 2 3",
    explanation: "First line: array size. Second line: array elements separated by spaces.",
  },
  {
    title: "Mixed Input",
    language: "java",
    code: `Scanner sc = new Scanner(System.in);
int n = sc.nextInt();
String name = sc.next();
double price = sc.nextDouble();`,
    input: "5\nApple\n2.50",
    explanation: "Different data types on separate lines. Use appropriate Scanner methods.",
  },
  {
    title: "String with Spaces",
    language: "java",
    code: `Scanner sc = new Scanner(System.in);
String line = sc.nextLine();
System.out.println("You entered: " + line);`,
    input: "Hello World",
    explanation: "Use nextLine() to read entire line including spaces.",
  },
]

interface InputHelperProps {
  onUseExample: (input: string) => void
  currentLanguage: string
}

export default function InputHelper({ onUseExample, currentLanguage }: InputHelperProps) {
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Input copied to clipboard",
    })
  }

  const relevantExamples = INPUT_EXAMPLES.filter((ex) => ex.language === currentLanguage)

  if (relevantExamples.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Input Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p>General input guidelines for {currentLanguage}:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Separate values with spaces or newlines</li>
              <li>Make sure input format matches your code expectations</li>
              <li>Check for proper data types</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-4 w-4" />
          Java Input Examples
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {relevantExamples.map((example, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{example.title}</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(example.input)}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={() => onUseExample(example.input)}>
                    Use Input
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600 mb-1">Code Pattern:</p>
                  <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{example.code}</pre>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Input:</p>
                  <pre className="bg-blue-50 p-2 rounded border border-blue-200">{example.input}</pre>
                  <p className="text-gray-600 mt-2">{example.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Common Issues:</p>
              <ul className="list-disc list-inside mt-1 text-yellow-700 space-y-1">
                <li>
                  <strong>InputMismatchException:</strong> Input type doesn't match Scanner method
                </li>
                <li>
                  <strong>NoSuchElementException:</strong> Not enough input provided
                </li>
                <li>
                  <strong>Solution:</strong> Match your input format exactly with Scanner calls
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
