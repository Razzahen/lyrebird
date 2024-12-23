import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinical Consultation System",
  description: "Medical consultation note-taking and summary generation system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
