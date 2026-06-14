'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './Navbar';
import Footer from './Footer';
import { useSettingsStore } from '@/store/settingsStore';
import { useThemeStore } from '@/store/themeStore';
import type { ThemeName } from '@/store/themeStore';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const fetchSettings = useSettingsStore(s => s.fetchSettings);
    const settings = useSettingsStore(s => s.settings);
    const applyTheme = useThemeStore(s => s.applyTheme);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Apply theme when settings are loaded
    useEffect(() => {
        if (settings?.colorTheme) {
            applyTheme(settings.colorTheme as ThemeName);
        }
    }, [settings?.colorTheme, applyTheme]);

    // Halaman tanpa Navbar & Footer (full-screen experience)
    const isFullScreen =
        pathname?.startsWith('/admin');

    if (isFullScreen) {
        return <>{children}</>;
    }


    return (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy_id'}>
            <Navbar />
            <main className="min-h-screen pt-16">
                {children}
            </main>
            <Footer />
        </GoogleOAuthProvider>
    );
}
