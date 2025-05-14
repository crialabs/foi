import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare, hash } from "bcryptjs" // Changed from bcrypt to bcryptjs
import { getDb } from "./db"
import { createServerSupabaseClient } from "./supabase/server"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        let db = null
        try {
          db = await getDb()

          // Check if user exists
          const user = await db.get("SELECT * FROM admins WHERE email = ?", [credentials.email])

          if (!user) {
            return null
          }

          // Check if password matches
          const passwordMatch = await compare(credentials.password, user.password)

          if (!passwordMatch) {
            return null
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        } finally {
          if (db) {
            await db.close().catch(console.error)
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
}

// Function to create a new admin user
export async function createAdmin(name: string, email: string, password: string, role = "admin") {
  let db = null
  try {
    db = await getDb()

    // Check if admin already exists
    const existingAdmin = await db.get("SELECT * FROM admins WHERE email = ?", [email])

    if (existingAdmin) {
      throw new Error("Admin with this email already exists")
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Insert new admin
    await db.run("INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)", [
      name,
      email,
      hashedPassword,
      role,
    ])

    return { success: true }
  } catch (error) {
    console.error("Error creating admin:", error)
    throw error
  } finally {
    if (db) {
      await db.close().catch(console.error)
    }
  }
}

export async function getSession() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUserProfile() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const supabase = createServerSupabaseClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  return profile
}

export async function isAdmin() {
  const profile = await getUserProfile()
  return profile?.role === "admin"
}
