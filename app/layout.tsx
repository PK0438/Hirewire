import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HireWire — Job Board',
  description: 'Find Data Engineer jobs from top sources across USA & UK',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%234f46e5'/><path d='M58 10 L28 55 H50 L42 90 L72 45 H50 Z' fill='white'/></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
