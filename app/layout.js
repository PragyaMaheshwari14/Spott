import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import Header from "@/components/header";
import { ConvexClientProvider } from "./ConvexClientPrvoider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
});

export const metadata = {
  title: "Spott",
  description: "Discover and create amazing events",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="bg-background text-foreground overflow-x-hidden w-full"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 10% -10%, oklch(0.88 0.055 150 / 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 90% 110%,  oklch(0.45 0.13 155 / 0.10) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%,   oklch(0.90 0.025 82 / 0.25) 0%, transparent 70%)
          `,
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: "oklch(0.45 0.13 155)",
                colorBackground: "oklch(0.97 0.012 85)",
                colorText: "oklch(0.18 0.02 80)",
                borderRadius: "1rem",
              },
            }}
          >
            <ConvexClientProvider>
              <Header />

              {/* 
                Mobile navbar = 2 rows: 56px (h-14) + ~52px (search row) = ~108px
                Tablet/desktop navbar = 1 row: 56px (h-14)
              */}
              <main className="relative w-full flex flex-col pt-[108px] sm:pt-[108px] md:pt-14">

                {/* Ambient light */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[oklch(0.88_0.055_150)] opacity-20 rounded-full blur-[120px]" />
                  <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-[oklch(0.45_0.13_155)] opacity-[0.08] rounded-full blur-[140px]" />
                </div>

                {/* Page content */}
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 py-6 sm:py-8 md:py-10">
                  {children}
                </div>

                {/* Footer — always visible */}
                <footer className="w-full mt-8 sm:mt-12 border-t border-[oklch(0.87_0.025_85_/_0.6)]">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-xs text-[oklch(0.55_0.025_80)]">
                      © {new Date().getFullYear()} Spott. All rights reserved.
                    </p>
                    <p className="text-xs text-[oklch(0.55_0.025_80)]">
                      Made with{" "}
                      <span className="text-[oklch(0.55_0.13_152)]">♥</span>{" "}
                      by Pragya
                    </p>
                  </div>
                </footer>

                <Toaster
                  richColors
                  toastOptions={{
                    style: {
                      background: "oklch(0.995 0.006 80)",
                      border: "1px solid oklch(0.87 0.025 85)",
                      color: "oklch(0.18 0.02 80)",
                      borderRadius: "1rem",
                    },
                  }}
                />
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}