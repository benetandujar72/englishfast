import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db";
import { seedVocabularyForUser } from "@/lib/seed-vocabulary";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

if (!authSecret) {
  throw new Error(
    "Missing auth secret. Set AUTH_SECRET (or NEXTAUTH_SECRET as fallback)."
  );
}

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth credentials. Set AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET (or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET as fallback)."
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  secret: authSecret,
  session: { strategy: "jwt" },
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (user.id) {
        await seedVocabularyForUser(user.id).catch(console.error);
      }
    },
  },
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
});
