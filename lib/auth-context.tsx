"use client"

import type { User } from "./models"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { users } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: Partial<User>, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Find the user in our mock data to get full user object
        const foundUser = users.find((u) => u.id === parsedUser.id)
        if (foundUser) {
          setUser(foundUser)
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("currentUser")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find user with matching email (in a real app, we'd check password too)
        const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (foundUser) {
          setUser(foundUser)
          localStorage.setItem("currentUser", JSON.stringify({ id: foundUser.id, email: foundUser.email }))
          resolve(true)
        } else {
          resolve(false)
        }
        setIsLoading(false)
      }, 1000)
    })
  }

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if email already exists
        const emailExists = users.some((u) => u.email.toLowerCase() === userData.email?.toLowerCase())
        if (emailExists) {
          resolve(false)
        } else {
          // Create new user (in a real app, this would be done on the server)
          const newUser: User = {
            id: `${users.length + 1}`,
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone,
            avatar: "/placeholder.svg?height=100&width=100",
            userType: userData.userType || "jobseeker",
            location: userData.location || {
              country: "O'zbekiston",
              region: "",
              city: "",
            },
            createdAt: new Date(),
            lastActive: new Date(),
            verificationStatus: "unverified",
            subscription: "free",
          }
          // In a real app, we would add this user to the database
          // For now, we'll just pretend it worked
          setUser(newUser)
          localStorage.setItem("currentUser", JSON.stringify({ id: newUser.id, email: newUser.email }))
          resolve(true)
        }
        setIsLoading(false)
      }, 1000)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
