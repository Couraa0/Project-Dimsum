'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, Truck, MapPin, Phone, QrCode, Package, UtensilsCrossed, CheckCircle, Leaf, ChefHat, Zap, CreditCard, ShieldCheck } from 'lucide-react';
import { menuApi } from '@/lib/api';
import type { MenuItem } from '@/types';
import MenuCard from '@/components/ui/MenuCard';
import { getImageUrl } from '@/lib/utils';

const testimonials = [
  { name: 'Siti Rahayu', role: 'Pelanggan Setia', text: 'Dimsum-nya enak banget! Har gow-nya lembut dan isian udaranya terasa segar. Sudah 3x order delivery, selalu on time dan panas!', rating: 5, avatar: '👩' },
  { name: 'Budi Santoso', role: 'Food Blogger', text: 'Kualitas rasa setara restoran, tapi harga sangat terjangkau. Paket mix-nya worth it banget untuk keluarga. Highly recommended!', rating: 5, avatar: '👨' },
  { name: 'Maya Putri', role: 'Ibu Rumah Tangga', text: 'QR code di meja keren banget, anak-anak senang pesan sendiri! Sistemnya mudah dan pesanan cepat datang. Pasti balik lagi!', rating: 5, avatar: '👩‍👧' },
  { name: 'Rudi Hermawan', role: 'Karyawan Swasta', text: 'Paket hemat kantor jadi andalan saya setiap hari Jumat. Porsinya pas, enak, dan pengirimannya cepat sampai kantor.', rating: 5, avatar: '👨‍💼' },
];

const features = [
  { icon: <Leaf size={22} />, title: 'Bahan Segar Harian', desc: 'Dipilih setiap pagi, disajikan fresh untuk rasa terbaik' },
  { icon: <ChefHat size={22} />, title: 'Koki Berpengalaman', desc: 'Resep tradisional autentik dari koki berpengalaman 15+ tahun' },
  { icon: <Zap size={22} />, title: 'Delivery Cepat', desc: 'Pengiriman dalam 30-60 menit ke seluruh area Karawang' },
  { icon: <CreditCard size={22} />, title: 'Bayar Mudah', desc: 'Transfer, QRIS, atau bayar di tempat — semua bisa!' },
];

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [featuredMenus, setFeaturedMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
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

    const timer = setInterval(() => setTestimonialIndex(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-red-50 via-red-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left — Text */}
          <div className="animate-slide-up">
            {/* Open badge */}
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-green-200 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Buka Setiap Hari · 10.00 – 21.00 WIB
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-5 tracking-tight">
              Dimsum Lezat,{' '}
              <span className="gradient-text block sm:inline">Siap Dinikmati!</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
              Cita rasa dimsum autentik khas China Town, kini hadir di Karawang. Dine-in nyaman, take away praktis, atau delivery langsung ke pintu Anda.
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
                { value: '500+', label: 'Pelanggan Puas' },
                { value: '4.9★', label: 'Rating Google' },
                { value: '20+', label: 'Varian Menu' },
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
            <div className="relative w-full max-w-[440px] aspect-square">
              {/* Blob bg */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 rounded-[40%_60%_70%_30%/30%_50%_70%_70%] rotate-6 scale-110" />
              <Image
                src="/images/hero.png"
                alt="Dimsum Ratu Signature"
                fill
                className="object-cover rounded-3xl relative z-10 shadow-2xl"
                priority
              />
              {/* Badge top-left */}
              <div className="absolute top-4 -left-4 z-20 bg-white rounded-2xl shadow-xl px-4 py-3 border border-red-50 flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <div className="text-[10px] text-gray-400 font-medium">Best Seller</div>
                  <div className="font-extrabold text-gray-800 text-sm">Har Gow 🥟</div>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#C1121F] font-semibold text-xs tracking-widest uppercase">Rekomendasi</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Best Seller Kami</h2>
            <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm leading-relaxed">Dimsum paling banyak dipesan dan disukai pelanggan setia Dimsum Ratu</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <div className="text-5xl mb-3">🥟</div>
              <p>Belum ada best seller tersedia</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#C1121F] text-[#C1121F] rounded-2xl font-bold hover:bg-[#C1121F] hover:text-white transition-all duration-200">
              Lihat Semua Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW TO ORDER ──────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#C1121F] font-semibold text-xs tracking-widest uppercase">Cara Pemesanan</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Mudah &amp; Cepat</h2>
            <p className="text-gray-400 mt-3 text-sm">Pesan dimsum favoritmu dalam 3 langkah mudah</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { step: '01', icon: <UtensilsCrossed size={26} />, title: 'Pilih Menu', desc: 'Browse menu lengkap kami, pilih favorit Anda sesuka hati' },
              { step: '02', icon: <Package size={26} />, title: 'Tambah Keranjang', desc: 'Klik tombol + lalu sesuaikan jumlah dan catatan pesanan' },
              { step: '03', icon: <CheckCircle size={26} />, title: 'Konfirmasi & Bayar', desc: 'Pilih metode bayar, pesanan langsung kami proses secepatnya' },
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

              <div className="flex gap-1 mb-5">
                {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
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

      {/* ── LOCATION ──────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-[#C1121F] font-semibold text-xs tracking-widest uppercase">Lokasi Kami</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight">Kunjungi Dimsum Ratu</h2>
            <p className="text-gray-500 mt-3 max-w-md mx-auto text-sm leading-relaxed">
              Nikmati suasana yang nyaman untuk dine-in bersama keluarga dan sahabat.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Map */}
            <div className="w-full h-[320px] md:h-[420px] rounded-3xl overflow-hidden shadow-md border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63447.39099520374!2d107.27120727889587!3d-6.334154474228071!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6977baaaffcbfd%3A0x6d3a08c27370d633!2sDimsum%20Ratu%20Oishii!5e0!3m2!1sid!2sid!4v1772400307613!5m2!1sid!2sid"
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
                  content: <><strong className="text-gray-800">Dimsum Ratu Oishii</strong><br />Karawang Barat, Jawa Barat, Indonesia</>,
                },
                {
                  icon: <Clock size={20} />,
                  title: 'Jam Operasional',
                  content: <>Setiap Hari: <strong className="text-gray-800">10.00 – 21.00 WIB</strong><br /><span className="text-xs text-gray-400">Dine-in · Takeaway · Delivery</span></>,
                },
                {
                  icon: <Phone size={20} />,
                  title: 'Hubungi Kami',
                  content: <>WhatsApp: <strong className="text-gray-800">0812-3456-7890</strong><br />Instagram: <strong className="text-gray-800">@dimsumratu</strong></>,
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
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Siap Menikmati Dimsum Terbaik?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">Kunjungi kami atau pesan delivery sekarang. Kami melayani dengan sepenuh hati!</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/menu" className="px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-bold hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 hover:scale-[1.02] inline-flex items-center gap-2 justify-center">
                Pesan Sekarang <ArrowRight size={18} />
              </Link>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
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
