"use client";

import { signIn } from "next-auth/react";

export default function AdminSignIn() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 sm:px-10 md:px-16 py-10">
      <div className="max-w-md w-full border rounded-lg p-6">
        <h1 className="text-xl font-semibold mb-4">Admin Sign In</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Sign in with your approved account to manage blog posts.
        </p>
        <button
          className="px-4 py-2 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          onClick={() => signIn("google", { callbackUrl: "/admin" })}
        >
          Continue with Google
        </button>
      </div>
    </main>
  );
}


