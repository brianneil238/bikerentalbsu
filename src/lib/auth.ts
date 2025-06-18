import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

// Log environment variables for debugging
console.log("🔍 Auth Config: NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing');
console.log("🔍 Auth Config: NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("🔍 Auth Config: DATABASE_URL:", process.env.DATABASE_URL ? 'Set' : 'Missing');

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔍 Auth: Authorize attempt for:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Auth: Missing credentials");
          throw new Error("Invalid credentials");
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          console.log("🔍 Auth: User found:", user ? 'Yes' : 'No');

          if (!user || !user.password) {
            console.log("❌ Auth: User not found or no password");
            throw new Error("Invalid credentials");
          }

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          console.log("🔍 Auth: Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("❌ Auth: Invalid password");
            throw new Error("Invalid credentials");
          }

          console.log("✅ Auth: Login successful for user:", user.useIid);
          return {
            id: user.useIid,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("❌ Auth Error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔍 JWT callback - user:", user ? 'Present' : 'Not present');
      console.log("🔍 JWT callback - token.sub:", token.sub);
      
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        };
      } else if (token.sub) {
        // On subsequent requests, 'user' is undefined, but 'token.sub' will contain the user ID.
        return {
          ...token,
          id: token.sub, // Ensure 'id' is populated from 'sub'
        };
      }
      console.log("🔍 JWT callback - final token:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("🔍 Session callback - token.id:", token.id);
      console.log("🔍 Session callback - token.role:", token.role);
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
  },
}; 