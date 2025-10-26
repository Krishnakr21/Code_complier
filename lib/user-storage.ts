// In-memory user storage (replace with database in production)
interface User {
  id: string
  name: string
  email: string
  password: string
}

// Global user storage
const users: User[] = []

export function addUser(user: User): void {
  users.push(user)
  console.log("User added. Total users:", users.length)
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id)
}

export function getAllUsers(): User[] {
  return users
}

export function getUserCount(): number {
  return users.length
}

// For debugging
export function logUsers(): void {
  console.log(
    "Current users in storage:",
    users.map((u) => ({ id: u.id, email: u.email, name: u.name })),
  )
}
