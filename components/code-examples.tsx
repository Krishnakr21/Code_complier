"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy } from "lucide-react"

interface CodeExample {
  title: string
  language: string
  code: string
  input?: string
  description: string
}

const CODE_EXAMPLES: CodeExample[] = [
  {
    title: "Sum of Two Numbers",
    language: "java",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter first number: ");
        int a = sc.nextInt();
        System.out.print("Enter second number: ");
        int b = sc.nextInt();
        System.out.println("Sum: " + (a + b));
        sc.close();
    }
}`,
    input: "5\n10",
    description: "Reads two integers and prints their sum",
  },
  {
    title: "Array Processing",
    language: "java",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter array size: ");
        int n = sc.nextInt();
        int[] arr = new int[n];
        
        System.out.println("Enter " + n + " numbers:");
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        int sum = 0;
        for (int num : arr) {
            sum += num;
        }
        
        System.out.println("Sum of array: " + sum);
        sc.close();
    }
}`,
    input: "3\n1 2 3",
    description: "Reads an array and calculates the sum",
  },
  {
    title: "Simple Calculator",
    language: "python",
    code: `print("Simple Calculator")
a = float(input("Enter first number: "))
b = float(input("Enter second number: "))
op = input("Enter operation (+, -, *, /): ")

if op == '+':
    result = a + b
elif op == '-':
    result = a - b
elif op == '*':
    result = a * b
elif op == '/':
    result = a / b if b != 0 else "Error: Division by zero"
else:
    result = "Invalid operation"

print(f"Result: {result}")`,
    input: "10\n5\n+",
    description: "A simple calculator with basic operations",
  },
  {
    title: "Fibonacci Series",
    language: "cpp",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Enter number of terms: ";
    cin >> n;
    
    int a = 0, b = 1, next;
    
    cout << "Fibonacci Series: ";
    for (int i = 0; i < n; i++) {
        if (i <= 1) {
            next = i;
        } else {
            next = a + b;
            a = b;
            b = next;
        }
        cout << next << " ";
    }
    cout << endl;
    
    return 0;
}`,
    input: "5",
    description: "Generates Fibonacci series up to n terms",
  },
]

interface CodeExamplesProps {
  onLoadExample: (code: string, language: string, input?: string) => void
}

export default function CodeExamples({ onLoadExample }: CodeExamplesProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Code Examples</h3>
      <div className="grid gap-4">
        {CODE_EXAMPLES.map((example, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{example.title}</CardTitle>
                  <Badge variant="outline">{example.language.toUpperCase()}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(example.code)}>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button size="sm" onClick={() => onLoadExample(example.code, example.language, example.input)}>
                    Load Example
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{example.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium mb-1">Code:</h4>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {example.code.substring(0, 200)}...
                  </pre>
                </div>
                {example.input && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Sample Input:</h4>
                    <pre className="text-xs bg-blue-50 p-2 rounded">{example.input}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
