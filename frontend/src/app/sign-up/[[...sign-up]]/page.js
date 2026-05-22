import { SignUp } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9fafb] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[#111827] hover:opacity-85 transition-opacity">
            <Zap className="h-6 w-6 text-[#4f46e5]" />
            <span className="text-xl font-bold tracking-tight">SchemeLens</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-[#111827]">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-[#4b5563]">
            Get personalized recommendations and automated scheme alerts
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6 sm:p-8">
          <SignUp 
            routing="path"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-[#111827] hover:bg-[#1f2937] text-white text-sm font-semibold rounded-md py-2.5 transition-all normal-case shadow-sm',
                card: 'shadow-none border-none p-0 w-full bg-white',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                footerActionLink: 'text-[#4f46e5] hover:text-[#4338ca] font-semibold transition-all',
                formFieldInput: 'rounded-md border-[#e5e7eb] focus:border-[#4f46e5] focus:ring-[#4f46e5] text-sm py-2 bg-white',
                socialButtonsBlockButton: 'rounded-md border-[#e5e7eb] hover:bg-[#f9fafb] text-sm py-2 transition-all bg-white',
                dividerText: 'text-[#4b5563] text-xs font-medium uppercase',
                dividerLine: 'bg-[#e5e7eb]'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
