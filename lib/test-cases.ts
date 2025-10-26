export interface TestCase {
  input: string
  expectedOutput: string
  description: string
}

export interface CodeTemplate {
  title: string
  language: string
  code: string
  testCases: TestCase[]
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    title: "Simple Addition (Fixed)",
    language: "java",
    difficulty: "Easy",
    category: "Basic I/O",
    description: "Correct way to read two numbers and print their sum",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read two integers (no prompts in competitive programming)
        int a = sc.nextInt();
        int b = sc.nextInt();
        
        // Calculate sum
        int sum = a + b;
        
        // Print only the result
        System.out.println(sum);
        
        sc.close();
    }
}`,
    testCases: [
      {
        input: "5 10",
        expectedOutput: "15",
        description: "Space-separated input",
      },
      {
        input: "5\n10",
        expectedOutput: "15",
        description: "Newline-separated input",
      },
    ],
  },
  {
    title: "Wrong Way (Your Original Code)",
    language: "java",
    difficulty: "Easy",
    category: "Common Mistakes",
    description: "Shows why your original code produces mixed output",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // WRONG: This reads input first, then prints
        int a = sc.nextInt();
        System.out.println("enter value" + a);  // This prints AFTER reading!
        
        int b = sc.nextInt();
        System.out.println("enter value" + b);  // This prints AFTER reading!
        
        int c = a + b;
        System.out.println(c);
        
        sc.close();
    }
}`,
    testCases: [
      {
        input: "5 10",
        expectedOutput: "enter value5\nenter value10\n15",
        description: "Shows the mixed output problem",
      },
    ],
  },
  {
    title: "Interactive Input (Correct Way)",
    language: "java",
    difficulty: "Easy",
    category: "Interactive Programs",
    description: "How to properly prompt for input in interactive programs",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // CORRECT: Print prompt BEFORE reading input
        System.out.print("Enter first number: ");
        int a = sc.nextInt();
        
        System.out.print("Enter second number: ");
        int b = sc.nextInt();
        
        int sum = a + b;
        System.out.println("Sum: " + sum);
        
        sc.close();
    }
}`,
    testCases: [
      {
        input: "5\n10",
        expectedOutput: "Enter first number: Enter second number: Sum: 15",
        description: "Proper interactive input handling",
      },
    ],
  },
  {
    title: "Competitive Programming Style",
    language: "java",
    difficulty: "Easy",
    category: "Best Practices",
    description: "Standard format for competitive programming problems",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read input (no prompts needed)
        int n = sc.nextInt();  // number of test cases or array size
        
        for (int i = 0; i < n; i++) {
            int x = sc.nextInt();
            // Process each number
            System.out.println(x * 2);  // Example: double each number
        }
        
        sc.close();
    }
}`,
    testCases: [
      {
        input: "3\n1 2 3",
        expectedOutput: "2\n4\n6",
        description: "Process multiple inputs without prompts",
      },
    ],
  },
  {
    title: "Sum of Two Numbers",
    language: "java",
    difficulty: "Easy",
    category: "Basic I/O",
    description: "Read two integers and print their sum",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read two integers
        int a = sc.nextInt();
        int b = sc.nextInt();
        
        // Calculate and print sum
        int sum = a + b;
        System.out.println(sum);
        
        sc.close();
    }
}`,
    testCases: [
      {
        input: "5 10",
        expectedOutput: "15",
        description: "Space-separated integers",
      },
      {
        input: "5\n10",
        expectedOutput: "15",
        description: "Newline-separated integers",
      },
      {
        input: "-3 7",
        expectedOutput: "4",
        description: "Negative number handling",
      },
      {
        input: "0 0",
        expectedOutput: "0",
        description: "Zero values",
      },
    ],
  },
  {
    title: "Array Sum",
    language: "java",
    difficulty: "Easy",
    category: "Arrays",
    description: "Calculate sum of array elements",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read array size
        int n = sc.nextInt();
        int[] arr = new int[n];
        
        // Read array elements
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        // Calculate sum
        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += arr[i];
        }
        
        System.out.println(sum);
        sc.close();
    }
}`,
    testCases: [
      {
        input: "3\n1 2 3",
        expectedOutput: "6",
        description: "Array size on first line, elements on second",
      },
      {
        input: "5\n10\n20\n30\n40\n50",
        expectedOutput: "150",
        description: "Each element on separate line",
      },
      {
        input: "1\n42",
        expectedOutput: "42",
        description: "Single element array",
      },
    ],
  },
  {
    title: "Maximum in Array",
    language: "java",
    difficulty: "Easy",
    category: "Arrays",
    description: "Find the maximum element in an array",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int[] arr = new int[n];
        
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        int max = arr[0];
        for (int i = 1; i < n; i++) {
            if (arr[i] > max) {
                max = arr[i];
            }
        }
        
        System.out.println(max);
        sc.close();
    }
}`,
    testCases: [
      {
        input: "5\n3 7 2 9 1",
        expectedOutput: "9",
        description: "Find maximum element",
      },
      {
        input: "3\n-5 -2 -8",
        expectedOutput: "-2",
        description: "All negative numbers",
      },
    ],
  },
  {
    title: "Count Even Numbers",
    language: "java",
    difficulty: "Easy",
    category: "Arrays",
    description: "Count even numbers in an array",
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int count = 0;
        
        for (int i = 0; i < n; i++) {
            int num = sc.nextInt();
            if (num % 2 == 0) {
                count++;
            }
        }
        
        System.out.println(count);
        sc.close();
    }
}`,
    testCases: [
      {
        input: "5\n1 2 3 4 5",
        expectedOutput: "2",
        description: "Count even numbers (2, 4)",
      },
      {
        input: "4\n2 4 6 8",
        expectedOutput: "4",
        description: "All even numbers",
      },
    ],
  },
  {
    title: "Factorial Calculator",
    language: "java",
    difficulty: "Easy",
    category: "Mathematics",
    description: "Calculate factorial of a number",
    code: `import java.util.*;

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
    testCases: [
      {
        input: "5",
        expectedOutput: "120",
        description: "5! = 120",
      },
      {
        input: "0",
        expectedOutput: "1",
        description: "0! = 1",
      },
      {
        input: "7",
        expectedOutput: "5040",
        description: "7! = 5040",
      },
    ],
  },
]
