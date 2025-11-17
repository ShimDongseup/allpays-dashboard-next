// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AllPays PG Dashboard",
  description: "PG 결제/가맹점 데이터 대시보드",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          <div className="mb-8">
            <Link href="/dashboard">
              <h1 className="text-xl font-bold">AllPays PG</h1>
            </Link>
            <p className="text-xs text-slate-400 mt-1">
              결제 · 가맹점 대시보드
            </p>
          </div>

          <nav className="space-y-2 text-sm">
            <Link
              href="/dashboard"
              className="block rounded-md px-3 py-2 hover:bg-slate-800"
            >
              대시보드
            </Link>
            <Link
              href="/transactions?page=1&sortBy=paymentAt&order=asc"
              className="block rounded-md px-3 py-2 hover:bg-slate-800"
            >
              거래 내역
            </Link>
            <Link
              href="/merchants"
              className="block rounded-md px-3 py-2 hover:bg-slate-800"
            >
              가맹점 목록
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 border-b border-slate-800 flex items-center px-6">
            <div className="text-sm text-slate-300">
              AllPays PG Admin Dashboard
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
