export interface AuthResult {
  success: boolean
  error?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    console.log("Attempting signin for:", email)

    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password }),
    })

    const data = await response.json()
    console.log("Signin response:", { status: response.status, data })

    if (response.ok && data.success) {
      // Reload the page to update session
      window.location.reload()
      return { success: true, user: data.user }
    } else {
      return { success: false, error: data.error || "Login failed" }
    }
  } catch (error) {
    console.error("Signin error:", error)
    return { success: false, error: "Network error. Please check your connection." }
  }
}

export async function signUp(name: string, email: string, password: string): Promise<AuthResult> {
  try {
    console.log("Attempting signup for:", { name, email })

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
      }),
    })

    const data = await response.json()
    console.log("Signup response:", { status: response.status, data })

    if (response.ok && data.success) {
      // Auto sign in after successful signup
      console.log("Signup successful, attempting auto-signin...")
      return await signIn(email, password)
    } else {
      return { success: false, error: data.error || "Signup failed" }
    }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "Network error. Please check your connection." }
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.reload()
  } catch (error) {
    console.error("Sign out error:", error)
    // Force reload even if signout request fails
    window.location.reload()
  }
}
