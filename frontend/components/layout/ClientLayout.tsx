'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Halaman tanpa Navbar & Footer (full-screen experience)
    const isFullScreen =
        pathname?.startsWith('/admin');

    if (isFullScreen) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-16">
                {children}
            </main>
            <Footer />
        </>
    );
}
