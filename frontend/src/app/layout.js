import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "SchemeLens — AI Government Scheme Recommendation Portal",
  description: "Discover, explore, and get personalized semantic search recommendations for Indian government welfare schemes with policy risk analytics.",
};

export default function RootLayout({ children }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyValid = publishableKey && 
                     publishableKey !== 'pk_test_placeholder_key' && 
                     publishableKey.startsWith('pk_');

  if (!isKeyValid) {
    return (
      <html
        lang="en"
        className={`${inter.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans bg-[#111827] text-white items-center justify-center p-6 text-center">
          <div className="max-w-lg bg-white text-[#111827] rounded-2xl p-8 border border-[#e5e7eb] shadow-2xl">
            <h1 className="text-2xl font-bold mb-3">Clerk Credentials Required</h1>
            <p className="text-sm text-[#4b5563] mb-6">
              SchemeLens utilizes Clerk to handle passwordless OTP email and Google authentication. To get started, configure your free API keys.
            </p>
            
            <div className="bg-[#f9fafb] rounded-xl p-4 text-left font-mono text-xs space-y-3 mb-6 border border-[#e5e7eb]">
              <div>
                <p className="font-semibold text-[#111827]">1. Get free keys from Clerk Dashboard:</p>
                <a 
                  href="https://dashboard.clerk.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#4f46e5] font-semibold underline hover:text-[#4338ca] block mt-1"
                >
                  https://dashboard.clerk.com
                </a>
              </div>
              
              <div>
                <p className="font-semibold text-[#111827]">2. Update your credentials:</p>
                <p className="text-[#4b5563] mt-0.5">Open the <code className="bg-[#e5e7eb] px-1 rounded text-red-500 font-semibold">frontend/.env.local</code> file and replace the placeholders with your actual Clerk keys:</p>
                <pre className="bg-[#111827] text-[#c7d2fe] p-3 rounded overflow-x-auto text-[11px] mt-2 leading-relaxed">
{`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...`}
                </pre>
              </div>
            </div>

            <p className="text-xs text-[#9ca3af]">
              Once updated, restart your development server to start building SchemeLens!
            </p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider publishableKey={publishableKey}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
