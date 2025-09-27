import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { NotificationProvider } from "@/contexts/NotificationContext";
import UserChatWrapper from "@/components/Chat/UserChatWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "File Converter - Convert your files to any format",
  description: "Convert your files to any format online. Fast, secure, and free file conversion service.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={inter.className}>
        <NotificationProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">
              <div style={{marginTop: "185px"}}>
              {children}

              </div>
            </main>
            <Footer />
            <UserChatWrapper />
          </div>
        </NotificationProvider>
      </body>
    </html>
  );
}