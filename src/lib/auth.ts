import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

// Log environment variables for debugging
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.useIid,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
      console.log("JWT callback - user:", user);
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
      console.log("JWT callback - token (after user check):", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback - token:", token);
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