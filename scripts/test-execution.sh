#!/bin/bash

echo "🧪 Testing code execution..."

# Test the API endpoint directly
echo "Testing API endpoint..."

# Test JavaScript
echo "1. Testing JavaScript..."
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "code": "console.log(\"Hello World!\");",
    "input": ""
  }' | jq '.'

echo ""

# Test Python
echo "2. Testing Python..."
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(\"Hello World!\")",
    "input": ""
  }' | jq '.'

echo ""

# Test Java
echo "3. Testing Java..."
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "java",
    "code": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(a + b);\n        sc.close();\n    }\n}",
    "input": "5 10"
  }' | jq '.'

echo ""
echo "✅ Test complete!"
