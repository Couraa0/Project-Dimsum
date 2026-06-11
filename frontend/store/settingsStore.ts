import { create } from 'zustand';
import { settingsApi } from '@/lib/api';

export interface StoreSettings {
    id: string;
    storeName: string;
    logo: string;
    address: string;
    operatingHours: string;
    contact: string;
    instagram: string;
    mapUrl: string;
    facebookUrl: string;
    instagramUrl: string;
    tiktokUrl: string;
    heroTitle: string;
    heroDesc: string;
    heroImage: string;
    stat1Val: string;
    stat1Label: string;
    stat2Val: string;
    stat2Label: string;
    stat3Val: string;
    stat3Label: string;
    feat1Title: string;
    feat1Desc: string;
    feat2Title: string;
    feat2Desc: string;
    feat3Title: string;
    feat3Desc: string;
    feat4Title: string;
    feat4Desc: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    ctaTitle: string;
    ctaDesc: string;
}


interface SettingsStore {
    settings: StoreSettings | null;
    loading: boolean;
    error: string | null;
    fetchSettings: () => Promise<void>;
    updateSettingsState: (settings: StoreSettings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
    settings: null,
    loading: false,
    error: null,
    fetchSettings: async () => {
        set({ loading: true, error: null });
        try {
            const res = await settingsApi.getAll();
            if (res.data && res.data.success) {
                set({ settings: res.data.data, loading: false });
            } else {
                set({ error: 'Gagal memuat pengaturan toko', loading: false });
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            set({ error: err.message || 'Gagal memuat pengaturan toko', loading: false });
        }
    },
    updateSettingsState: (settings) => set({ settings }),
}));
