import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthCodeError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error || "An unknown error occurred during authentication.";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 py-10">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">
            Authentication Error
          </h1>
          <p className="mt-2 text-stone-500">
            We encountered a problem while verifying your email.
          </p>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>

        <div className="flex justify-center">
          <Link
            href="/login"
            className="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
