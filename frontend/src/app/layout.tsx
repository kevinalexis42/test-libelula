import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Insurtech - Cotización y Emisión de Pólizas',
  description: 'Plataforma insurtech para cotización y emisión de pólizas de seguro',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-center text-sm py-4 mt-16">
          <p>InsurTech Platform — LibelulaSoft Technical Evaluation 2026</p>
        </footer>
      </body>
    </html>
  );
}
