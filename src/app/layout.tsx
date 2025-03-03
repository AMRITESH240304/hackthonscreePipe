import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@vercel/analytics/react"
import { ChatButton } from "@/components/chat-button"
import { RootProvider } from "@/components/providers/root-provider"
import { Squares } from "@/components/ui/squares-background"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Meeting • Screenpipe",
  description: "The AI notepad for people in back-to-back meetings"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body 
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen relative`}
      >
        <RootProvider>
          {/* Squares background */}
          <div className="absolute inset-0 z-0">
            <Squares 
              direction="diagonal"
              speed={0.5}
              squareSize={40}
              borderColor="#333" 
              hoverFillColor="#222"
            />
          </div>
          <main className="h-full p-4 overflow-hidden relative z-10">
            {children}
          </main>
          <Toaster />
          <ChatButton />
          {/* Comment this out temporarily for testing */}
          {/* <Analytics mode={process.env.NODE_ENV === "development" ? "development" : "production"} /> */}
        </RootProvider>
      </body>
    </html>
  )
}