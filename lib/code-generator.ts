export interface InputDetection {
  needsInput: boolean
  suggestion?: string
  examples?: string[]
}

export function detectInputNeeds(code: string, language: string): InputDetection {
  const patterns = {
    java: [/Scanner.*nextInt$$$$/g, /Scanner.*nextLine$$$$/g, /Scanner.*next$$$$/g, /BufferedReader/g, /System\.in/g],
    cpp: [/cin\s*>>/g, /scanf/g, /getline/g],
    python: [/input$$$$/g, /int$$input\($$\)/g, /map$$int,\s*input\($$\.split$$$$\)/g],
    javascript: [/readline$$$$/g, /process\.stdin/g, /require.*readline/g],
  }

  const langPatterns = patterns[language as keyof typeof patterns] || []
  const needsInput = langPatterns.some((pattern) => pattern.test(code))

  if (!needsInput) {
    return { needsInput: false }
  }

  // Generate smart input suggestions based on code analysis
  const suggestion = generateInputSuggestion(code, language)
  const examples = generateInputExamples(code, language)

  return {
    needsInput: true,
    suggestion,
    examples,
  }
}

function generateInputSuggestion(code: string, language: string): string {
  // Analyze code patterns to suggest appropriate input
  if (language === "java") {
    if (code.includes("nextInt()")) {
      const intCount = (code.match(/nextInt$$$$/g) || []).length
      if (intCount === 2) return "5 10"
      if (intCount === 1) return "42"
      if (intCount > 2)
        return Array(intCount)
          .fill(0)
          .map((_, i) => i + 1)
          .join(" ")
    }
    if (code.includes("nextLine()")) return "Hello World"
  }

  if (language === "cpp") {
    if (code.includes("cin >>")) {
      const matches = code.match(/cin\s*>>\s*\w+/g) || []
      if (matches.length === 2) return "5 10"
      if (matches.length === 1) return "42"
    }
  }

  if (language === "python") {
    if (code.includes("map(int, input().split())")) return "1 2 3 4 5"
    if (code.includes("int(input())")) return "42"
    if (code.includes("input()")) return "Hello World"
  }

  return "5 10"
}

function generateInputExamples(code: string, language: string): string[] {
  const examples = []

  // Common patterns
  if (code.toLowerCase().includes("array") || code.toLowerCase().includes("list")) {
    examples.push("5\n1 2 3 4 5")
    examples.push("3\n10 20 30")
  }

  if (code.toLowerCase().includes("sum") || code.toLowerCase().includes("add")) {
    examples.push("5 10")
    examples.push("100 200")
  }

  if (code.toLowerCase().includes("sort")) {
    examples.push("5\n3 1 4 1 5")
    examples.push("4\n9 2 7 1")
  }

  return examples.length > 0 ? examples : ["5 10", "1 2 3", "Hello World"]
}

export function generateSampleInput(code: string, language: string): string {
  const detection = detectInputNeeds(code, language)
  return detection.suggestion || ""
}

export async function generateCode(prompt: string, language: string): Promise<string> {
  // This would typically call an AI API, but for now we'll use templates
  const templates = getCodeTemplates(prompt.toLowerCase(), language)
  return templates[Math.floor(Math.random() * templates.length)]
}

function getCodeTemplates(prompt: string, language: string): string[] {
  const templates: Record<string, Record<string, string[]>> = {
    java: {
      sum: [
        `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int a = sc.nextInt();
        int b = sc.nextInt();
        System.out.println(a + b);
        sc.close();
    }
}`,
      ],
      factorial: [
        `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        long factorial = 1;
        for (int i = 1; i <= n; i++) {
            factorial *= i;
        }
        System.out.println(factorial);
        sc.close();
    }
}`,
      ],
      array: [
        `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        // Process array
        for (int i = 0; i < n; i++) {
            System.out.print(arr[i] + " ");
        }
        sc.close();
    }
}`,
      ],
    },
    python: {
      sum: [
        `a, b = map(int, input().split())
print(a + b)`,
      ],
      factorial: [
        `n = int(input())
factorial = 1
for i in range(1, n + 1):
    factorial *= i
print(factorial)`,
      ],
      array: [
        `n = int(input())
arr = list(map(int, input().split()))
print(*arr)`,
      ],
    },
    cpp: {
      sum: [
        `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}`,
      ],
      factorial: [
        `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long factorial = 1;
    for (int i = 1; i <= n; i++) {
        factorial *= i;
    }
    cout << factorial << endl;
    return 0;
}`,
      ],
    },
    javascript: {
      sum: [
        `// For Node.js environment
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('', (input) => {
    const [a, b] = input.split(' ').map(Number);
    console.log(a + b);
    rl.close();
});`,
      ],
    },
  }

  // Find matching template
  for (const [key, template] of Object.entries(templates[language] || {})) {
    if (prompt.includes(key)) {
      return template
    }
  }

  // Default template
  return [LANGUAGES[language as keyof typeof LANGUAGES]?.template || "// Code here"]
}

const LANGUAGES = {
  javascript: {
    template: `// Write any JavaScript code here
console.log("Hello World!");`,
  },
  python: {
    template: `# Write any Python code here
print("Hello World!")`,
  },
  java: {
    template: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write any Java code here
        System.out.println("Hello World!");
    }
}`,
  },
  cpp: {
    template: `#include <iostream>
using namespace std;

int main() {
    // Write any C++ code here
    cout << "Hello World!" << endl;
    return 0;
}`,
  },
}
