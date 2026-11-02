import NextAuth, { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ profile, user }) {
      const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
      const email = (user?.email ?? (profile as any)?.email ?? "").toLowerCase().trim();
      return !!email && email === adminEmail;
    },
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email ?? session.user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};



/**
 * Whether this request is signed in as the site admin.
 *
 * The proxy already guards every /admin route; pages that show unpublished
 * content check again here so a mistake in its matcher cannot expose them.
 */
export async function isAdminSession(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const email = (session?.user?.email ?? "").toLowerCase().trim();
  return !!email && email === adminEmail;
}
