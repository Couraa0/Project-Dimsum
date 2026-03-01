'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Clock, Truck, Users, ChevronLeft, ChevronRight, CheckCircle, MapPin, Phone, QrCode, Package, UtensilsCrossed } from 'lucide-react';
import { menuApi } from '@/lib/api';
import type { MenuItem } from '@/types';
import MenuCard from '@/components/ui/MenuCard';
import { formatCurrency } from '@/lib/utils';

const testimonials = [
  { name: 'Siti Rahayu', role: 'Pelanggan Setia', text: 'Dimsum-nya enak banget! Har gow-nya lembut dan isian udaranya terasa segar. Sudah 3x order delivery, selalu on time dan panas!', rating: 5, avatar: '👩' },
  { name: 'Budi Santoso', role: 'Food Blogger', text: 'Kualitas rasa setara restoran, tapi harga sangat terjangkau. Paket mix-nya worth it banget untuk keluarga. Highly recommended!', rating: 5, avatar: '👨' },
  { name: 'Maya Putri', role: 'Ibu Rumah Tangga', text: 'QR code di meja keren banget, anak-anak senang pesan sendiri! Sistemnya mudah dan pesanan cepat datang. Pasti balik lagi!', rating: 5, avatar: '👩‍👧' },
  { name: 'Rudi Hermawan', role: 'Karyawan Swasta', text: 'Paket hemat kantor jadi andalan saya setiap hari Jumat. Porsinya pas, enak, dan pengirimannya cepat sampai kantor.', rating: 5, avatar: '👨‍💼' },
];

export default function HomePage() {
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    menuApi.getAll({ bestSeller: 'true' })
      .then(res => setBestSellers(res.data.data.slice(0, 6)))
      .catch(() => { })
      .finally(() => setLoading(false));

    const timer = setInterval(() => setTestimonialIndex(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: '🥟', title: 'Bahan Segar', desc: 'Dipilih setiap hari, disajikan fresh untuk rasa terbaik' },
    { icon: '⚡', title: 'Koki Berpengalaman', desc: 'Resep tradisional autentik dari koki berpengalaman 15+ tahun' },
    { icon: '🚀', title: 'Delivery Cepat', desc: 'Pengiriman dalam 30-60 menit ke seluruh area Karawang' },
    { icon: '💳', title: 'Bayar Mudah', desc: 'Transfer, QRIS, atau bayar di tempat — semua bisa!' },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center bg-white pattern-bg overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-10 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-50 rounded-full blur-2xl opacity-50 translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-red-50 text-[#C1121F] text-sm font-semibold px-4 py-2 rounded-full mb-6 border border-red-100">
              <span className="w-2 h-2 bg-[#C1121F] rounded-full animate-pulse" />
              Buka Setiap Hari 10.00 – 21.00 WIB
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Dimsum Lezat,{' '}
              <span className="gradient-text">Siap Dinikmati!</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Cita rasa dimsum autentik khas China Town, kini hadir di Karawang. Dine-in nyaman, take away praktis, atau delivery langsung ke pintu Anda.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <UtensilsCrossed size={14} className="text-[#C1121F]" /> Dine-In
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <Package size={14} className="text-[#C1121F]" /> Take Away
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <Truck size={14} className="text-[#C1121F]" /> Delivery
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <QrCode size={14} className="text-[#C1121F]" /> QR Meja
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/order" className="px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-semibold text-base hover:bg-[#a50f1a] transition-all shadow-red hover:scale-105 flex items-center justify-center gap-2">
                Pesan Sekarang <ArrowRight size={18} />
              </Link>
              <Link href="/menu" className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-base hover:border-[#C1121F] hover:text-[#C1121F] transition-all flex items-center justify-center gap-2">
                Lihat Menu
              </Link>
            </div>
            {/* Stats */}
            <div className="flex gap-6 mt-10">
              {[
                { value: '500+', label: 'Pelanggan Puas' },
                { value: '4.9★', label: 'Rating' },
                { value: '20+', label: 'Varian Menu' },
              ].map(stat => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-[#C1121F]">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative flex justify-center animate-float">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-50 rounded-[40%_60%_70%_30%/30%_50%_70%_70%] rotate-6" />
              <Image
                src="/images/hero.png"
                alt="Dimsum Ratu"
                fill
                className="object-cover rounded-3xl relative z-10 shadow-2xl"
                priority
              />
            </div>
            {/* Floating badges */}
            <div className="absolute top-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 z-20 border border-red-50">
              <div className="text-xs text-gray-500">Best Seller</div>
              <div className="font-bold text-gray-800 text-sm">Har Gow 🥟</div>
            </div>
            <div className="absolute bottom-4 -right-4 bg-[#C1121F] text-white rounded-2xl shadow-lg px-4 py-3 z-20">
              <div className="text-xs opacity-80">Mulai dari</div>
              <div className="font-bold text-base">Rp 18.000</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-100">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ─────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#C1121F] font-semibold text-sm tracking-wider uppercase">Menu Pilihan</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Best Seller Kami</h2>
            <p className="text-gray-400 mt-3 max-w-md mx-auto">Dimsum paling banyak dipesan dan disukai pelanggan setia Dimsum Ratu</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <div className="text-5xl mb-3">🥟</div>
              <p>Memuat menu...</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link href="/menu" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[#C1121F] text-[#C1121F] rounded-2xl font-semibold hover:bg-[#C1121F] hover:text-white transition-all">
              Lihat Semua Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How to Order ─────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#C1121F] to-[#8b0e16] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">Cara Pesan</h2>
            <p className="opacity-75 mt-3">Mudah, cepat, dan menyenangkan</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📱', title: 'Pilih Menu', desc: 'Browse menu lengkap kami, pilih favorit Anda' },
              { step: '02', icon: '🛒', title: 'Tambah Keranjang', desc: 'Klik tombol + dan sesuaikan jumlah pesanan' },
              { step: '03', icon: '✅', title: 'Konfirmasi & Bayar', desc: 'Pilih metode bayar, pesanan langsung diproses' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-5xl font-black text-white/10 mb-2">{s.step}</div>
                <div className="text-3xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/order" className="px-10 py-4 bg-white text-[#C1121F] rounded-2xl font-bold text-base hover:bg-gray-50 transition-all shadow-2xl inline-flex items-center gap-2">
              Mulai Pesan Sekarang <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#C1121F] font-semibold text-sm uppercase tracking-wider">Testimoni</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Kata Pelanggan Kami</h2>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 min-h-[200px]">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} size={18} className="text-yellow-400" fill="#facc15" />
                ))}
              </div>
              <p className="text-gray-700 text-lg leading-relaxed italic mb-6">"{testimonials[testimonialIndex].text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl">
                  {testimonials[testimonialIndex].avatar}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{testimonials[testimonialIndex].name}</div>
                  <div className="text-sm text-gray-400">{testimonials[testimonialIndex].role}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === testimonialIndex ? 'bg-[#C1121F] w-6' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Siap Menikmati Dimsum Terbaik?</h2>
          <p className="text-gray-400 mb-8">Kunjungi kami atau pesan delivery sekarang. Kami melayani dengan sepenuh hati!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/order" className="px-8 py-4 bg-[#C1121F] text-white rounded-2xl font-semibold hover:bg-[#a50f1a] transition-all shadow-red inline-flex items-center gap-2 justify-center">
              Pesan Sekarang <ArrowRight size={18} />
            </Link>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 bg-green-500 text-white rounded-2xl font-semibold hover:bg-green-600 transition-all inline-flex items-center gap-2 justify-center">
              📞 WhatsApp Kami
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
