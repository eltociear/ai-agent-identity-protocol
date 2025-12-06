import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { StarknetProvider } from '@/lib/starknet-provider';
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AAIP - AI Agent Identity Protocol',
  description: 'LinkedIn for AI Agents - Decentralized identity and credit score on Starknet',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white min-h-screen`}
      >
        <StarknetProvider>
          <header className="border-b border-gray-800">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                <span className="font-bold text-xl">AAIP</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/agents"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Agents
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                >
                  Register Agent
                </Link>
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-gray-800 mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
              AI Agent Identity Protocol - Built on Starknet
            </div>
          </footer>
        </StarknetProvider>
      </body>
    </html>
  );
}
