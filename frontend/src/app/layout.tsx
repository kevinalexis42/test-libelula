import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Insurtech - Cotización y Emisión de Pólizas',
  description: 'Plataforma insurtech para cotización y emisión de pólizas de seguro',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">InsurTech</span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/quote" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
                Nueva Cotización
              </a>
              <a
                href="/login"
                className="text-sm bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-gray-900 text-gray-400 text-center text-sm py-4 mt-16">
          <p>InsurTech Platform — LibelulaSoft Technical Evaluation 2026</p>
        </footer>
      </body>
    </html>
  );
}
