export const LANGUAGES = {
  javascript: {
    name: "JavaScript",
    extension: "js",
    template: `// JavaScript Code
console.log("Hello, World!");

// Example with input (uncomment to use):
// const readline = require('readline');
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// 
// rl.question('Enter a number: ', (answer) => {
//   console.log('You entered:', answer);
//   rl.close();
// });`,
  },
  python: {
    name: "Python",
    extension: "py",
    template: `# Python Code
print("Hello, World!")

# Example with input (uncomment to use):
# name = input("Enter your name: ")
# print(f"Hello, {name}!")`,
  },
  java: {
    name: "Java",
    extension: "java",
    template: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Read two numbers
        int a = sc.nextInt();
        int b = sc.nextInt();
        
        // Calculate and print result
        int sum = a + b;
        System.out.println(sum);
        
        sc.close();
    }
}`,
  },
  cpp: {
    name: "C++",
    extension: "cpp",
    template: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    
    // Example with input (uncomment to use):
    // int num;
    // cout << "Enter a number: ";
    // cin >> num;
    // cout << "You entered: " << num << endl;
    
    return 0;
}`,
  },
}
