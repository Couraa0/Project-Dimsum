import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import ClientLayout from '@/components/layout/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dimsum Ratu – Dimsum Lezat di Karawang',
  description: 'Nikmati cita rasa dimsum autentik terbaik di Karawang. Tersedia dine-in, take away, dan delivery. Pesan sekarang!',
  keywords: 'dimsum karawang, dimsum ratu, pesan dimsum, dimsum delivery karawang',
  openGraph: {
    title: 'Dimsum Ratu – Dimsum Lezat di Karawang',
    description: 'Pesan dimsum lezat favorit Anda dengan mudah!',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ClientLayout>{children}</ClientLayout>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2500,
            style: { borderRadius: '12px', fontFamily: 'Poppins, sans-serif', fontSize: '14px' }
          }}
        />
      </body>
    </html>
  );
}
