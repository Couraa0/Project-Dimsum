import { create } from 'zustand';
import { menuApi, categoriesApi, testimonialsApi } from '@/lib/api';
import type { MenuItem, Category } from '@/types';

interface DataStore {
    menus: MenuItem[];
    categories: Category[];
    testimonials: any[];
    bestSellers: MenuItem[];
    featuredMenus: MenuItem[];
    lastFetch: number;
    loading: boolean;
    error: string | null;
    fetchData: (force?: boolean) => Promise<void>;
}

export const useDataStore = create<DataStore>((set, get) => ({
    menus: [],
    categories: [],
    testimonials: [],
    bestSellers: [],
    featuredMenus: [],
    lastFetch: 0,
    loading: false,
    error: null,

    fetchData: async (force = false) => {
        const now = Date.now();
        // Menggunakan cache jika data sudah ada dan belum lewat 15 menit (900.000 ms)
        if (!force && get().menus.length > 0 && now - get().lastFetch < 900000) {
            return;
        }

        set({ loading: true, error: null });
        try {
            const [menusRes, catsRes, testiRes] = await Promise.all([
                menuApi.getAll(),
                categoriesApi.getAll(),
                testimonialsApi.getAll().catch(() => ({ data: { data: [] } }))
            ]);

            const allMenus = menusRes.data.data;
            const allCats = catsRes.data.data;
            const allTesti = testiRes.data.data;

            // Filter data untuk beranda secara efisien
            const withImg = allMenus.filter((i: MenuItem) => i.image);
            
            // Urutkan berdasarkan yang paling banyak dipesan jika tidak ada flag isBestSeller
            const sortedByOrders = [...withImg].sort((a, b) => b.totalOrdered - a.totalOrdered);
            const bestSellers = sortedByOrders.slice(0, 6);
            
            // Ambil beberapa menu acak atau terbaru untuk featured
            const featuredMenus = withImg.slice(0, 4);

            set({
                menus: allMenus,
                categories: allCats,
                testimonials: allTesti,
                bestSellers,
                featuredMenus,
                lastFetch: now,
                loading: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Gagal mengambil data', loading: false });
        }
    }
}));
