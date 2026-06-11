'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, Truck, MapPin, Phone, QrCode, Package, UtensilsCrossed, CheckCircle, Leaf, ChefHat, Zap, CreditCard, ShieldCheck } from 'lucide-react';
import { menuApi, testimonialsApi } from '@/lib/api';
import type { MenuItem } from '@/types';
import MenuCard from '@/components/ui/MenuCard';
import { getImageUrl } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';


export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [featuredMenus, setFeaturedMenus] = useState<MenuItem[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const settings = useSettingsStore(s => s.settings);
  const storeName = (mounted && settings?.storeName) ? settings.storeName : 'Dimsum Ratu';
  const address = (mounted && settings?.address) ? settings.address : 'Jl. Raya Karawang No. 88, Karawang Barat, Jawa Barat';
  const operatingHours = (mounted && settings?.operatingHours) ? settings.operatingHours : 'Setiap Hari: 10.00 – 21.00 WIB';
  const contact = (mounted && settings?.contact) ? settings.contact : '0878-7131-0560';
  const instagram = (mounted && settings?.instagram) ? settings.instagram : '@dimsumratu';
  const mapUrl = (mounted && settings?.mapUrl) ? settings.mapUrl : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63447.39099520374!2d107.27120727889587!3d-6.334154474228071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6977baaaffcbfd%3A0x6d3a08c27370d633!2sDimsum%20Ratu%20Oishii!5e0!3m2!1sid!2sid!4v1772400307613!5m2!1sid!2sid';

  const heroTitle = (mounted && settings?.heroTitle) ? settings.heroTitle : 'Dimsum Lezat, Siap Dinikmati!';
  const heroDesc = (mounted && settings?.heroDesc) ? settings.heroDesc : 'Cita rasa dimsum autentik khas China Town, kini hadir di Karawang. Dine-in nyaman, take away praktis, atau delivery langsung ke pintu Anda.';
  const heroImage = (mounted && settings?.heroImage) ? settings.heroImage : '/images/hero.png';
  
  const stat1Val = (mounted && settings?.stat1Val) ? settings.stat1Val : '500+';
  const stat1Label = (mounted && settings?.stat1Label) ? settings.stat1Label : 'Pelanggan Puas';
  const stat2Val = (mounted && settings?.stat2Val) ? settings.stat2Val : '4.9★';
  const stat2Label = (mounted && settings?.stat2Label) ? settings.stat2Label : 'Rating Google';
  const stat3Val = (mounted && settings?.stat3Val) ? settings.stat3Val : '20+';
  const stat3Label = (mounted && settings?.stat3Label) ? settings.stat3Label : 'Varian Menu';

  const feat1Title = (mounted && settings?.feat1Title) ? settings.feat1Title : 'Bahan Segar Harian';
  const feat1Desc = (mounted && settings?.feat1Desc) ? settings.feat1Desc : 'Dipilih setiap pagi, disajikan fresh untuk rasa terbaik';
  const feat2Title = (mounted && settings?.feat2Title) ? settings.feat2Title : 'Koki Berpengalaman';
  const feat2Desc = (mounted && settings?.feat2Desc) ? settings.feat2Desc : 'Resep tradisional autentik dari koki berpengalaman 15+ tahun';
  const feat3Title = (mounted && settings?.feat3Title) ? settings.feat3Title : 'Delivery Cepat';
  const feat3Desc = (mounted && settings?.feat3Desc) ? settings.feat3Desc : 'Pengiriman dalam 30-60 menit ke seluruh area Karawang';
  const feat4Title = (mounted && settings?.feat4Title) ? settings.feat4Title : 'Bayar Mudah';
  const feat4Desc = (mounted && settings?.feat4Desc) ? settings.feat4Desc : 'Transfer, QRIS, atau bayar di tempat — semua bisa!';

  const step1Title = (mounted && settings?.step1Title) ? settings.step1Title : 'Pilih Menu';
  const step1Desc = (mounted && settings?.step1Desc) ? settings.step1Desc : 'Browse menu lengkap kami, pilih favorit Anda sesuka hati';
  const step2Title = (mounted && settings?.step2Title) ? settings.step2Title : 'Tambah Keranjang';
  const step2Desc = (mounted && settings?.step2Desc) ? settings.step2Desc : 'Klik tombol + lalu sesuaikan jumlah dan catatan pesanan';
  const step3Title = (mounted && settings?.step3Title) ? settings.step3Title : 'Konfirmasi & Bayar';
  const step3Desc = (mounted && settings?.step3Desc) ? settings.step3Desc : 'Pilih metode bayar, pesanan langsung kami proses secepatnya';

  const ctaTitle = (mounted && settings?.ctaTitle) ? settings.ctaTitle : 'Siap Menikmati Dimsum Terbaik?';
  const ctaDesc = (mounted && settings?.ctaDesc) ? settings.ctaDesc : 'Kunjungi kami atau pesan delivery sekarang. Kami melayani dengan sepenuh hati!';

  const features = [
    { icon: <Leaf size={22} />, title: feat1Title, desc: feat1Desc },
    { icon: <ChefHat size={22} />, title: feat2Title, desc: feat2Desc },
    { icon: <Zap size={22} />, title: feat3Title, desc: feat3Desc },
    { icon: <CreditCard size={22} />, title: feat4Title, desc: feat4Desc },
  ];

  const renderHeroTitle = () => {
    const parts = heroTitle.split(',');
    if (parts.length > 1) {
      return (
        <>
          {parts[0]}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C1121F] to-[#8b0e16] block sm:inline">{parts.slice(1).join(',')}</span>
        </>
      );
    }
    return heroTitle;
  };

  const getCleanPhoneForWhatsApp = (phone: string): string => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.substring(1);
    }
    return clean || '6287871310560';
  };

  useEffect(() => {
    setMounted(true);
    menuApi.getAll({ bestSeller: 'true' })
      .then(res => {
        const withImg = res.data.data.filter((i: MenuItem) => i.image);
        setBestSellers(withImg.slice(0, 6));
      })
      .catch(() => { })
      .finally(() => setLoading(false));

    menuApi.getAll()
      .then(res => {
        const withImg = res.data.data.filter((i: MenuItem) => i.image);
        setFeaturedMenus(withImg.slice(0, 4));
      })
      .catch(() => { });

    testimonialsApi.getAll()
      .then(res => {
        if (res.data && res.data.success) {
          setTestimonials(res.data.data);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setTestimonialIndex(i => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials]);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-6 pb-12 lg:pt-10 lg:pb-20 bg-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-red-50 via-red-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center w-full">
          {/* Left — Text */}
          <div className="animate-slide-up">
            {/* Open badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-green-200 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {operatingHours}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              {renderHeroTitle()}
            </h1>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
              {heroDesc}
            </p>

            {/* Badge chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { icon: <UtensilsCrossed size={13} />, label: 'Dine-In' },
                { icon: <Package size={13} />, label: 'Take Away' },
                { icon: <Truck size={13} />, label: 'Delivery' },
                { icon: <QrCode size={13} />, label: 'QR Meja' },
              ].map(b => (
                <div key={b.label} className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-full font-medium">
                  <span className="text-[#C1121F]">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/menu" className="px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-bold text-base hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 hover:shadow-red-300 hover:scale-[1.02] flex items-center justify-center gap-2">
                Pesan Sekarang <ArrowRight size={18} />
              </Link>
              <Link href="/menu" className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-base hover:border-[#C1121F] hover:text-[#C1121F] transition-all flex items-center justify-center gap-2">
                Lihat Menu
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-6 border-t border-gray-100">
              {[
                { value: stat1Val, label: stat1Label },
                { value: stat2Val, label: stat2Label },
                { value: stat3Val, label: stat3Label },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-extrabold text-[#C1121F]">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Image */}
          <div className="relative flex justify-center lg:justify-end animate-float">
            <div className="relative w-full max-w-[480px] aspect-square">
              {/* Blob bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 rounded-[40%_60%_70%_30%/30%_50%_70%_70%] rotate-6 scale-110" />
              <Image
                src={getImageUrl(heroImage)}
                alt={`${storeName} Signature`}
                fill
                className="object-cover rounded-3xl relative z-10 shadow-2xl"
                priority
              />
              {/* Badge top-left */}
              <div className="absolute top-4 -left-4 z-20 bg-white rounded-2xl shadow-xl px-4 py-3 border border-red-50 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <div className="text-[10px] text-gray-400 font-medium">Best Seller</div>
                  <div className="font-extrabold text-gray-800 text-sm">
                    {bestSellers.length > 0 ? (
                      bestSellers[0].name.length > 12 ? bestSellers[0].name.substring(0, 10) + '...' : bestSellers[0].name
                    ) : 'Har Gow'} 🥟
                  </div>
                </div>
              </div>
              {/* Badge bottom-right */}
              <div className="absolute bottom-4 -right-4 z-20 bg-[#C1121F] text-white rounded-2xl shadow-xl px-4 py-3">
                <div className="text-xs opacity-80 font-medium">Mulai dari</div>
                <div className="font-extrabold text-lg">Rp 18.000</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100 group cursor-default">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ──────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C1121F] text-[10px] font-bold uppercase tracking-wider mb-4 border border-red-100">
              <Star size={12} fill="#C1121F" /> Most Popular
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Menu <span className="text-[#C1121F]">Best Seller</span> <br />Pilihan Pelanggan
            </h2>
            <p className="text-gray-500 mt-4 text-sm md:text-base leading-relaxed">
              Varian dimsum paling favorit yang wajib Anda coba. Dibuat dengan resep rahasia dan bahan-bahan premium pilihan setiap harinya.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="bg-gray-100 rounded-3xl aspect-[4/5] animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {bestSellers.map((item, idx) => (
                <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                  <MenuCard item={item} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[2.5rem] py-20 text-center border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-6">🥟</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada Best Seller</h3>
              <p className="text-gray-400 max-w-xs mx-auto text-sm">Oops! Sepertinya admin belum menandai menu best seller. Silakan cek menu lengkap kami.</p>
              <Link href="/menu" className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-100">
                Pilih Menu <ArrowRight size={18} />
              </Link>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/menu" className="inline-flex items-center gap-2 text-[#C1121F] font-bold hover:gap-3 transition-all group">
              Lihat Semua Menu <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW TO ORDER ──────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#C1121F] font-semibold text-xs tracking-widest uppercase">Cara Pemesanan</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Mudah &amp; Cepat</h2>
            <p className="text-gray-400 mt-3 text-sm">Pesan dimsum favoritmu dalam 3 langkah mudah</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { step: '01', icon: <UtensilsCrossed size={26} />, title: step1Title, desc: step1Desc },
              { step: '02', icon: <Package size={26} />, title: step2Title, desc: step2Desc },
              { step: '03', icon: <CheckCircle size={26} />, title: step3Title, desc: step3Desc },
            ].map((s, i) => (
              <div key={i} className="relative bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-[#C1121F]/20 hover:shadow-lg transition-all group overflow-hidden">
                {/* Step number — kontras, jelas terbaca */}
                <div className="absolute top-5 right-5 w-10 h-10 bg-[#C1121F] rounded-xl flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">{s.step}</span>
                </div>
                {/* Icon */}
                <div className="w-14 h-14 bg-red-50 text-[#C1121F] rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#C1121F] group-hover:text-white transition-colors">
                  {s.icon}
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/menu" className="px-10 py-4 bg-[#C1121F] text-white rounded-2xl font-extrabold text-base hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 inline-flex items-center gap-2 hover:scale-[1.02]">
              Mulai Pesan Sekarang <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      {mounted && testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <span className="text-[#C1121F] font-semibold text-xs uppercase tracking-widest">Testimoni</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Kata Pelanggan Kami</h2>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 min-h-[220px] relative overflow-hidden">
                {/* Decorative quote mark */}
                <div className="absolute top-6 right-8 text-8xl text-gray-100 font-serif leading-none select-none">"</div>

                {testimonials[testimonialIndex] && (
                  <>
                    <div className="flex gap-1 mb-5">
                      {[...Array(testimonials[testimonialIndex].rating || 5)].map((_, i) => (
                        <Star key={i} size={16} className="text-yellow-400" fill="#facc15" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed mb-7 relative z-10">
                      "{testimonials[testimonialIndex].text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-red-50 rounded-full flex items-center justify-center text-2xl ring-2 ring-red-100">
                        {testimonials[testimonialIndex].avatar}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{testimonials[testimonialIndex].name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{testimonials[testimonialIndex].role}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center gap-2 mt-6">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => setTestimonialIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === testimonialIndex ? 'bg-[#C1121F] w-7' : 'bg-gray-200 w-2 hover:bg-gray-300'}`} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── LOCATION ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#C1121F] font-semibold text-xs tracking-widest uppercase">Lokasi Kami</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Kunjungi {storeName}</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm leading-relaxed">
              Nikmati suasana yang nyaman untuk dine-in bersama keluarga dan sahabat.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Map */}
            <div className="w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-md border border-gray-200">
              <iframe
                src={mapUrl}
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: <MapPin size={20} />,
                  title: 'Alamat Outlet',
                  content: <><strong className="text-gray-800">{storeName}</strong><br />{address}</>,
                },
                {
                  icon: <Clock size={20} />,
                  title: 'Jam Operasional',
                  content: <>{operatingHours}<br /><span className="text-xs text-gray-400">Dine-in · Takeaway · Delivery</span></>,
                },
                {
                  icon: <Phone size={20} />,
                  title: 'Hubungi Kami',
                  content: <>WhatsApp: <strong className="text-gray-800">{contact}</strong><br />Instagram: <strong className="text-gray-800">{instagram}</strong></>,
                },
              ].map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md hover:border-red-100 transition-all group">
                  <div className="bg-red-50 text-[#C1121F] p-3 rounded-xl shrink-0 group-hover:bg-[#C1121F] group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-3xl py-14 px-8 shadow-sm">
            <div className="text-4xl mb-4">🥟</div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">{ctaTitle}</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">{ctaDesc}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/menu" className="px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 hover:scale-[1.02] inline-flex items-center gap-2 justify-center">
                Pesan Sekarang <ArrowRight size={18} />
              </Link>
              <a href={`https://wa.me/${getCleanPhoneForWhatsApp(contact)}`} target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all inline-flex items-center gap-2 justify-center hover:scale-[1.02]">
                💬 WhatsApp Kami
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
