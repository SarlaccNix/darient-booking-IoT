import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Workspace Booking',
  description: 'Workspace Reservation Management System — Darien Technology Hub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="text-lg font-bold text-indigo-600">
              WorkspaceBook
            </Link>
            <div className="flex gap-6 text-sm font-medium text-gray-600">
              <Link href="/spaces" className="hover:text-indigo-600 transition-colors">
                Spaces
              </Link>
              <Link href="/bookings" className="hover:text-indigo-600 transition-colors">
                Bookings
              </Link>
              <Link href="/admin" className="hover:text-indigo-600 transition-colors">
                Admin
              </Link>
              <Link href="/api-key" className="hover:text-indigo-600 transition-colors">
                API Key
              </Link>
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
