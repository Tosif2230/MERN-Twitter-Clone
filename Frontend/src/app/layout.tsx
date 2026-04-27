import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Slide } from "react-toastify/unstyled";
import I18nProvider from "../components/providers/I18nProvider";
import { AuthProvider } from "../context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "X Clone - Social Media Platform ",
  description: "A modern Twitter clone built with Next.JS",
  icons:{
    icon:"/X-Twitter.svg"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider><AuthProvider>{children}</AuthProvider></I18nProvider>
         <ToastContainer
          position="top-center"
          autoClose={3000}
          theme="dark"
          transition={Slide}
        />
      </body>
    </html>
  );
}
