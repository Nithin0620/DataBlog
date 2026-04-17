import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "DataBlog | Connect & Share",
  description: "A premium social media application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col font-sans`}>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
          {children}
        </main>
      </body>
    </html>
  );
}
