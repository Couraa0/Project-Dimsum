'use client';
import { useState, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { getImageUrl } from '@/lib/utils';
import { settingsApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Save, Upload, Store, MapPin, Clock, Phone, ArrowLeft, Image as ImageIcon, Instagram, Globe, BarChart3, CheckCircle, Layers, Zap, Palette, Check } from 'lucide-react';
import Link from 'next/link';
import { useThemeStore, THEME_OPTIONS, type ThemeName } from '@/store/themeStore';

export default function AdminSettingsPage() {
    const { settings, loading, fetchSettings, updateSettingsState } = useSettingsStore();
    
    // Form state
    const [storeName, setStoreName] = useState('');
    const [address, setAddress] = useState('');
    const [operatingHours, setOperatingHours] = useState('');
    const [contact, setContact] = useState('');
    const [instagram, setInstagram] = useState('');
    const [mapUrl, setMapUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    
    // Homepage content state
    const [heroTitle, setHeroTitle] = useState('');
    const [heroDesc, setHeroDesc] = useState('');
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const [heroImagePreview, setHeroImagePreview] = useState('');

    const [stat1Val, setStat1Val] = useState('');
    const [stat1Label, setStat1Label] = useState('');
    const [stat2Val, setStat2Val] = useState('');
    const [stat2Label, setStat2Label] = useState('');
    const [stat3Val, setStat3Val] = useState('');
    const [stat3Label, setStat3Label] = useState('');

    const [feat1Title, setFeat1Title] = useState('');
    const [feat1Desc, setFeat1Desc] = useState('');
    const [feat2Title, setFeat2Title] = useState('');
    const [feat2Desc, setFeat2Desc] = useState('');
    const [feat3Title, setFeat3Title] = useState('');
    const [feat3Desc, setFeat3Desc] = useState('');
    const [feat4Title, setFeat4Title] = useState('');
    const [feat4Desc, setFeat4Desc] = useState('');

    const [step1Title, setStep1Title] = useState('');
    const [step1Desc, setStep1Desc] = useState('');
    const [step2Title, setStep2Title] = useState('');
    const [step2Desc, setStep2Desc] = useState('');
    const [step3Title, setStep3Title] = useState('');
    const [step3Desc, setStep3Desc] = useState('');

    const [ctaTitle, setCtaTitle] = useState('');
    const [ctaDesc, setCtaDesc] = useState('');
    const [colorTheme, setColorTheme] = useState<ThemeName>('red');
    const [taxRate, setTaxRate] = useState<number>(10);
    
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const heroImageInputRef = useRef<HTMLInputElement>(null);
    const { applyTheme } = useThemeStore();

    // Sync state dengan data store
    useEffect(() => {
        if (!settings) {
            fetchSettings();
        } else {
            setStoreName(settings.storeName || '');
            setAddress(settings.address || '');
            setOperatingHours(settings.operatingHours || '');
            setContact(settings.contact || '');
            setInstagram(settings.instagram || '');
            setMapUrl(settings.mapUrl || '');
            setFacebookUrl(settings.facebookUrl || '');
            setInstagramUrl(settings.instagramUrl || '');
            setTiktokUrl(settings.tiktokUrl || '');
            
            // Hero Title & Description
            setHeroTitle(settings.heroTitle || '');
            setHeroDesc(settings.heroDesc || '');

            // Stats
            setStat1Val(settings.stat1Val || '');
            setStat1Label(settings.stat1Label || '');
            setStat2Val(settings.stat2Val || '');
            setStat2Label(settings.stat2Label || '');
            setStat3Val(settings.stat3Val || '');
            setStat3Label(settings.stat3Label || '');

            // Features
            setFeat1Title(settings.feat1Title || '');
            setFeat1Desc(settings.feat1Desc || '');
            setFeat2Title(settings.feat2Title || '');
            setFeat2Desc(settings.feat2Desc || '');
            setFeat3Title(settings.feat3Title || '');
            setFeat3Desc(settings.feat3Desc || '');
            setFeat4Title(settings.feat4Title || '');
            setFeat4Desc(settings.feat4Desc || '');

            // Steps
            setStep1Title(settings.step1Title || '');
            setStep1Desc(settings.step1Desc || '');
            setStep2Title(settings.step2Title || '');
            setStep2Desc(settings.step2Desc || '');
            setStep3Title(settings.step3Title || '');
            setStep3Desc(settings.step3Desc || '');

            // CTA Banner
            setCtaTitle(settings.ctaTitle || '');
            setCtaDesc(settings.ctaDesc || '');

            // Color Theme
            setColorTheme((settings.colorTheme as ThemeName) || 'red');

            // Tax Rate
            setTaxRate(settings.taxRate ?? 10);

            // Logo Preview
            if (settings.logo) {
                if (settings.logo.startsWith('http') || settings.logo.startsWith('/') || settings.logo.startsWith('data:image')) {
                    setLogoPreview(settings.logo);
                } else {
                    setLogoPreview(getImageUrl(settings.logo));
                }
            } else {
                setLogoPreview('/logo.png');
            }

            // Hero Image Preview
            if (settings.heroImage) {
                if (settings.heroImage.startsWith('http') || settings.heroImage.startsWith('/') || settings.heroImage.startsWith('data:image')) {
                    setHeroImagePreview(settings.heroImage);
                } else {
                    setHeroImagePreview(getImageUrl(settings.heroImage));
                }
            } else {
                setHeroImagePreview('/images/hero.png');
            }
        }
    }, [settings, fetchSettings]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error('Ukuran file maksimal adalah 5MB');
            }
            if (!/jpeg|jpg|png|webp/i.test(file.type)) {
                return toast.error('Format file harus berupa gambar (JPG, PNG, WEBP)');
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error('Ukuran file maksimal adalah 5MB');
            }
            if (!/jpeg|jpg|png|webp/i.test(file.type)) {
                return toast.error('Format file harus berupa gambar (JPG, PNG, WEBP)');
            }
            setHeroImageFile(file);
            setHeroImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeName.trim()) {
            return toast.error('Nama toko tidak boleh kosong');
        }

        setSaving(true);
        const loadingToast = toast.loading('Menyimpan pengaturan...');

        try {
            const formData = new FormData();
            formData.append('storeName', storeName);
            formData.append('address', address);
            formData.append('operatingHours', operatingHours);
            formData.append('contact', contact);
            formData.append('instagram', instagram);
            formData.append('mapUrl', mapUrl);
            formData.append('facebookUrl', facebookUrl);
            formData.append('instagramUrl', instagramUrl);
            formData.append('tiktokUrl', tiktokUrl);
            
            // Homepage Dynamic Fields
            formData.append('heroTitle', heroTitle);
            formData.append('heroDesc', heroDesc);
            formData.append('stat1Val', stat1Val);
            formData.append('stat1Label', stat1Label);
            formData.append('stat2Val', stat2Val);
            formData.append('stat2Label', stat2Label);
            formData.append('stat3Val', stat3Val);
            formData.append('stat3Label', stat3Label);

            formData.append('feat1Title', feat1Title);
            formData.append('feat1Desc', feat1Desc);
            formData.append('feat2Title', feat2Title);
            formData.append('feat2Desc', feat2Desc);
            formData.append('feat3Title', feat3Title);
            formData.append('feat3Desc', feat3Desc);
            formData.append('feat4Title', feat4Title);
            formData.append('feat4Desc', feat4Desc);

            formData.append('step1Title', step1Title);
            formData.append('step1Desc', step1Desc);
            formData.append('step2Title', step2Title);
            formData.append('step2Desc', step2Desc);
            formData.append('step3Title', step3Title);
            formData.append('step3Desc', step3Desc);

            formData.append('ctaTitle', ctaTitle);
            formData.append('ctaDesc', ctaDesc);
            formData.append('colorTheme', colorTheme);
            formData.append('taxRate', taxRate.toString());

            if (logoFile) {
                formData.append('logo', logoFile);
            }
            if (heroImageFile) {
                formData.append('heroImage', heroImageFile);
            }

            const res = await settingsApi.update(formData);
            
            if (res.data && res.data.success) {
                updateSettingsState(res.data.data);
                toast.success('Pengaturan berhasil disimpan!', { id: loadingToast });
                setLogoFile(null);
                setHeroImageFile(null);
            } else {
                toast.error(res.data.message || 'Gagal menyimpan pengaturan', { id: loadingToast });
            }
        } catch (err: any) {
            console.error('Error saving settings:', err);
            toast.error(err.response?.data?.message || 'Gagal menghubungkan ke server', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 w-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2.5 bg-white border border-gray-100 hover:bg-gray-50 text-gray-500 rounded-xl transition-all shadow-sm hover:scale-105">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Pengaturan White Label</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Ubah nama, logo, konten halaman beranda, dan operasional website Anda</p>
                    </div>
                </div>
            </div>

            {loading && !settings ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-10 h-10 border-4 border-[var(--color-200)] border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
                    <p className="text-gray-400 text-sm">Memuat pengaturan toko...</p>
                </div>
            ) : (
                <form onSubmit={handleSave} className="w-full space-y-8">
                    
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-10">
                            
                            {/* Color Theme Section */}
                            <div>
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5 mb-4">
                                    <Palette size={14} /> Tema Warna
                                </h3>
                                <p className="text-gray-400 text-xs mb-4">Pilih warna utama website</p>
                                <div className="grid grid-cols-5 gap-3">
                                    {THEME_OPTIONS.map((theme) => (
                                        <button
                                            key={theme.name}
                                            type="button"
                                            onClick={() => {
                                                setColorTheme(theme.name);
                                                applyTheme(theme.name);
                                            }}
                                            className={`group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all hover:scale-105 ${
                                                colorTheme === theme.name
                                                    ? 'border-gray-800 bg-gray-50 shadow-md'
                                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                            title={theme.label}
                                        >
                                            <div className="relative">
                                                <div
                                                    className="w-10 h-10 rounded-full shadow-sm transition-transform group-hover:scale-110"
                                                    style={{ backgroundColor: theme.color }}
                                                />
                                                {colorTheme === theme.name && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Check size={18} className="text-white drop-shadow-md" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-bold transition-colors ${
                                                colorTheme === theme.name ? 'text-gray-800' : 'text-gray-400'
                                            }`}>
                                                {theme.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Logo Upload Section */}
                            <div>
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5 mb-2">
                                    <ImageIcon size={14} /> Logo Toko
                                </h3>
                                <p className="text-gray-400 text-[11px] mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                    Format: <b>PNG/JPG</b> (1:1), Min 200x200px, Max <b>2MB</b>.
                                </p>

                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-32 h-32 mx-auto rounded-3xl border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:bg-gray-100/50 group relative shadow-sm mb-4"
                                >
                                    {logoPreview ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={logoPreview} alt="Logo Preview" className="object-contain w-full h-full p-3 bg-white transition-transform group-hover:scale-[1.02]" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-all">
                                                <Upload size={18} className="mb-1 animate-pulse" />
                                                Ganti Logo
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400 p-4">
                                            <Upload size={24} className="mx-auto mb-2 text-gray-300" />
                                            <span className="text-[10px] font-medium block">Pilih Gambar</span>
                                        </div>
                                    )}
                                </div>
                                
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange} 
                                />

                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl font-bold text-xs transition-all active:scale-[0.98] shadow-sm"
                                >
                                    Pilih File Logo
                                </button>
                            </div>

                            {/* Hero Image Section */}
                            <div>
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5 mb-2">
                                    <ImageIcon size={14} /> Gambar Banner Beranda
                                </h3>
                                <p className="text-gray-400 text-[11px] mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                                    Format: <b>JPG/PNG/WEBP</b> (1:1), Min 800x800px, Max <b>5MB</b>.
                                </p>

                                <div 
                                    onClick={() => heroImageInputRef.current?.click()}
                                    className="w-full h-36 rounded-3xl border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:bg-gray-100/50 group relative shadow-sm mb-4"
                                >
                                    {heroImagePreview ? (
                                        <>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={heroImagePreview} alt="Hero Preview" className="object-cover w-full h-full bg-white transition-transform group-hover:scale-[1.02]" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold transition-all">
                                                <Upload size={18} className="mb-1 animate-pulse" />
                                                Ganti Banner
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400 p-4">
                                            <Upload size={24} className="mx-auto mb-2 text-gray-300" />
                                            <span className="text-[10px] font-medium block">Pilih Gambar</span>
                                        </div>
                                    )}
                                </div>
                                
                                <input 
                                    ref={heroImageInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleHeroFileChange} 
                                />

                                <button 
                                    type="button" 
                                    onClick={() => heroImageInputRef.current?.click()}
                                    className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-2xl font-bold text-xs transition-all active:scale-[0.98] shadow-sm"
                                >
                                    Pilih Gambar Banner
                                </button>
                            </div>

                            {/* ---------------------------------------------------------------------- */}
                            
                            {/* Section 1: Profil Utama */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <Store size={14} /> Profil Utama Toko
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Nama Toko / Brand <span className="text-[var(--color-primary)]">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Dimsum Ratu"
                                            value={storeName}
                                            onChange={(e) => setStoreName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Jam Operasional
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Setiap Hari: 10.00 – 21.00 WIB"
                                            value={operatingHours}
                                            onChange={(e) => setOperatingHours(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Pajak (Tax) %
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                placeholder="Contoh: 10"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                                                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Kontak & Media Sosial */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <Phone size={14} /> Kontak & Media Sosial
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Nomor Kontak / WhatsApp
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: 0878-7131-0560"
                                            value={contact}
                                            onChange={(e) => setContact(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Username Instagram (Label Beranda)
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: @dimsumratu"
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Tautan Facebook (URL)
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: https://facebook.com/..."
                                            value={facebookUrl}
                                            onChange={(e) => setFacebookUrl(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Tautan Instagram (URL)
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: https://instagram.com/..."
                                            value={instagramUrl}
                                            onChange={(e) => setInstagramUrl(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Tautan TikTok (URL)
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: https://tiktok.com/@..."
                                            value={tiktokUrl}
                                            onChange={(e) => setTiktokUrl(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Informasi Lokasi & Peta */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <MapPin size={14} /> Informasi Lokasi & Peta
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Alamat Outlet / Cabang
                                        </label>
                                        <textarea 
                                            rows={2}
                                            placeholder="Contoh: Jl. Raya Karawang No. 88, Karawang Barat, Jawa Barat"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5 flex items-center gap-1">
                                            <Globe size={12} /> Tautan Embed Peta (Google Maps Iframe Src)
                                        </label>
                                        <textarea 
                                            rows={3}
                                            placeholder="Tempel tautan src dari iframe Google Maps share (https://www.google.com/maps/embed?...)"
                                            value={mapUrl}
                                            onChange={(e) => setMapUrl(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all resize-none font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Konten Hero Beranda */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <ImageIcon size={14} /> Konten Hero (Halaman Atas)
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Judul Hero (Gunakan koma `,` untuk memisahkan teks berwarna merah)
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Dimsum Lezat, Siap Dinikmati!"
                                            value={heroTitle}
                                            onChange={(e) => setHeroTitle(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">
                                            Deskripsi Singkat Hero
                                        </label>
                                        <textarea 
                                            rows={3}
                                            placeholder="Masukkan deskripsi penawaran utama toko Anda..."
                                            value={heroDesc}
                                            onChange={(e) => setHeroDesc(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Nilai Statistik */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <BarChart3 size={14} /> Angka Statistik Toko
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <span className="text-xs font-extrabold text-gray-700">Statistik 1</span>
                                        <input type="text" placeholder="Nilai (e.g. 500+)" value={stat1Val} onChange={e => setStat1Val(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Label (e.g. Pelanggan)" value={stat1Label} onChange={e => setStat1Label(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <span className="text-xs font-extrabold text-gray-700">Statistik 2</span>
                                        <input type="text" placeholder="Nilai (e.g. 4.9★)" value={stat2Val} onChange={e => setStat2Val(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Label (e.g. Google Rating)" value={stat2Label} onChange={e => setStat2Label(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <span className="text-xs font-extrabold text-gray-700">Statistik 3</span>
                                        <input type="text" placeholder="Nilai (e.g. 20+)" value={stat3Val} onChange={e => setStat3Val(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Label (e.g. Menu)" value={stat3Label} onChange={e => setStat3Label(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 6: Keunggulan Layanan */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <CheckCircle size={14} /> Keunggulan Layanan (4 Poin)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <span className="text-xs font-extrabold text-gray-800">Keunggulan 1</span>
                                        <input type="text" placeholder="Judul" value={feat1Title} onChange={e => setFeat1Title(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Deskripsi" value={feat1Desc} onChange={e => setFeat1Desc(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <span className="text-xs font-extrabold text-gray-800">Keunggulan 2</span>
                                        <input type="text" placeholder="Judul" value={feat2Title} onChange={e => setFeat2Title(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Deskripsi" value={feat2Desc} onChange={e => setFeat2Desc(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <span className="text-xs font-extrabold text-gray-800">Keunggulan 3</span>
                                        <input type="text" placeholder="Judul" value={feat3Title} onChange={e => setFeat3Title(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Deskripsi" value={feat3Desc} onChange={e => setFeat3Desc(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                                        <span className="text-xs font-extrabold text-gray-800">Keunggulan 4</span>
                                        <input type="text" placeholder="Judul" value={feat4Title} onChange={e => setFeat4Title(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Deskripsi" value={feat4Desc} onChange={e => setFeat4Desc(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 7: Langkah Pemesanan */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <Layers size={14} /> Langkah Pemesanan (3 Langkah)
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <span className="col-span-2 text-xs font-extrabold text-gray-800">Langkah 1</span>
                                        <input type="text" placeholder="Judul Langkah 1" value={step1Title} onChange={e => setStep1Title(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Deskripsi Langkah 1" value={step1Desc} onChange={e => setStep1Desc(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <span className="col-span-2 text-xs font-extrabold text-gray-800">Langkah 2</span>
                                        <input type="text" placeholder="Judul Langkah 2" value={step2Title} onChange={e => setStep2Title(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Deskripsi Langkah 2" value={step2Desc} onChange={e => setStep2Desc(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <span className="col-span-2 text-xs font-extrabold text-gray-800">Langkah 3</span>
                                        <input type="text" placeholder="Judul Langkah 3" value={step3Title} onChange={e => setStep3Title(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                        <input type="text" placeholder="Deskripsi Langkah 3" value={step3Desc} onChange={e => setStep3Desc(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                                    </div>
                                </div>
                            </div>

                            {/* Section 8: Banner CTA Bawah */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider pb-2 border-b border-gray-50 flex items-center gap-1.5">
                                    <Zap size={14} /> Banner CTA Bawah
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">Judul Banner CTA</label>
                                        <input type="text" placeholder="Contoh: Siap Menikmati Dimsum Terbaik?" value={ctaTitle} onChange={e => setCtaTitle(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 block mb-1.5">Deskripsi Banner CTA</label>
                                        <textarea rows={2} placeholder="Masukkan deskripsi banner..." value={ctaDesc} onChange={e => setCtaDesc(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-100)] focus:border-[var(--color-primary)] text-sm hover:border-gray-300 transition-all resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Save Button */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-4 bg-[var(--color-primary)] text-white rounded-2xl font-bold text-base hover:bg-[var(--color-hover)] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[0_8px_24px_rgba(var(--color-rgb),0.15)] hover:shadow-[0_8px_24px_rgba(var(--color-rgb),0.25)] flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                                >
                                    {saving ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Simpan Pengaturan
                                        </>
                                    )}
                                </button>
                            </div>

                    </div>
                </form>
            )}
        </div>
    );
}
