import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
        const tokenEmail = (token?.email ?? "").toLowerCase().trim();
        return !!tokenEmail && tokenEmail === adminEmail;
      },
    },
    pages: {
      signIn: "/admin/signin",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};


