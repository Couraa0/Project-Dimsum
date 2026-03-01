'use client';
import { useEffect, useRef, useState } from 'react';
import { X, Camera, AlertCircle, RefreshCw, QrCode, CheckCircle, SwitchCamera } from 'lucide-react';

interface QRScannerModalProps {
    onScan: (tableNumber: string) => void;
    onClose: () => void;
}

type Phase = 'permission' | 'scanning' | 'error' | 'success';

export default function QRScannerModal({ onScan, onClose }: QRScannerModalProps) {
    const html5QrRef = useRef<any>(null);
    const isScanningRef = useRef(false);

    const [phase, setPhase] = useState<Phase>('permission');
    const [errorMsg, setErrorMsg] = useState('');
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [activeCam, setActiveCam] = useState<string>('');
    const [scannedTable, setScannedTable] = useState('');

    /* ── parse table number dari berbagai format QR ── */
    const parseTable = (text: string): string => {
        text = text.trim();
        // Full URL atau relative path dengan query
        try { return new URL(text).searchParams.get('meja') || new URL(text).searchParams.get('table') || ''; } catch { }
        const m = text.match(/[?&](?:meja|table)=([^&]+)/);
        if (m) return m[1];
        // Angka bersih
        if (/^\d+$/.test(text)) return text;
        return '';
    };

    /* ── stop scanner ─────────────────────────────── */
    const stopScanner = async () => {
        if (html5QrRef.current && isScanningRef.current) {
            try { await html5QrRef.current.stop(); } catch { }
            isScanningRef.current = false;
        }
    };

    /* ── start scanning dengan kamera tertentu ────── */
    const startCamera = async (cameraId?: string) => {
        setPhase('scanning');
        setErrorMsg('');

        const { Html5Qrcode } = await import('html5-qrcode');

        // Buat instance baru jika belum ada
        if (!html5QrRef.current) {
            html5QrRef.current = new Html5Qrcode('qr-video-container');
        } else {
            await stopScanner();
        }

        const constraints = cameraId
            ? { deviceId: { exact: cameraId } }
            : { facingMode: 'environment' };

        try {
            await html5QrRef.current.start(
                constraints,
                { fps: 10, qrbox: { width: 240, height: 240 } },
                (decoded: string) => {
                    const tableNum = parseTable(decoded);
                    if (tableNum) {
                        stopScanner();
                        setScannedTable(tableNum);
                        setPhase('success');
                        setTimeout(() => onScan(tableNum), 900);
                    }
                    // abaikan QR yang tidak relevan
                },
                undefined // error per-frame diabaikan
            );
            isScanningRef.current = true;
        } catch (err: any) {
            const msg = err?.message || '';
            if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
                setErrorMsg('Izin kamera ditolak. Buka pengaturan browser dan izinkan akses kamera.');
            } else if (msg.toLowerCase().includes('device') || msg.toLowerCase().includes('found')) {
                setErrorMsg('Kamera tidak ditemukan di perangkat ini.');
            } else {
                setErrorMsg('Gagal mengakses kamera. Pastikan browser mendukung dan izin sudah diberikan.');
            }
            setPhase('error');
        }
    };

    /* ── minta daftar kamera ──────────────────────── */
    const requestPermission = async () => {
        setPhase('scanning');
        try {
            const { Html5Qrcode } = await import('html5-qrcode');
            const devices = await Html5Qrcode.getCameras();
            if (devices?.length) {
                setCameras(devices.map(d => ({ id: d.id, label: d.label || `Kamera ${d.id.slice(-4)}` })));
                // Preferensikan kamera belakang
                const back = devices.find(d => /back|rear|environment/i.test(d.label));
                const chosen = back || devices[0];
                setActiveCam(chosen.id);
                startCamera(chosen.id);
            } else {
                setErrorMsg('Tidak ada kamera yang tersedia.');
                setPhase('error');
            }
        } catch (err: any) {
            const msg = err?.message || '';
            if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('denied')) {
                setErrorMsg('Izin kamera ditolak. Buka pengaturan browser dan izinkan akses kamera, lalu coba lagi.');
            } else {
                setErrorMsg('Gagal mengakses kamera. Coba muat ulang halaman.');
            }
            setPhase('error');
        }
    };

    /* ── ganti kamera ─────────────────────────────── */
    const switchCamera = async () => {
        if (cameras.length < 2) return;
        const idx = cameras.findIndex(c => c.id === activeCam);
        const next = cameras[(idx + 1) % cameras.length];
        setActiveCam(next.id);
        await startCamera(next.id);
    };

    /* ── cleanup on unmount ───────────────────────── */
    useEffect(() => () => { stopScanner(); }, []);

    /* ─────────────────────────────────────────────── */
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { stopScanner(); onClose(); } }}>

            <div className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden">

                {/* ── Header ────────────────────────── */}
                <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#C1121F] to-[#8b0e16] rounded-xl flex items-center justify-center shadow">
                            <QrCode size={17} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-gray-900">Scan QR Meja</h2>
                            <p className="text-[10px] text-gray-400 leading-none mt-0.5">
                                {phase === 'scanning' ? 'Arahkan ke QR code di meja' : 'Izinkan akses kamera'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => { stopScanner(); onClose(); }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400">
                        <X size={18} />
                    </button>
                </div>

                {/* ── PHASE: PERMISSION ─────────────── */}
                {phase === 'permission' && (
                    <div className="px-5 pb-8 flex flex-col items-center text-center">
                        {/* Ilustrasi */}
                        <div className="relative mb-6 mt-2">
                            <div className="w-32 h-32 bg-gradient-to-br from-red-50 to-amber-50 rounded-3xl flex items-center justify-center">
                                <Camera size={56} className="text-[#C1121F]" strokeWidth={1.5} />
                            </div>
                            {/* corner decorations */}
                            <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#C1121F] rounded-tl-lg" />
                            <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#C1121F] rounded-tr-lg" />
                            <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#C1121F] rounded-bl-lg" />
                            <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#C1121F] rounded-br-lg" />
                        </div>

                        <h3 className="font-extrabold text-gray-900 text-base mb-1.5">Izin Kamera Diperlukan</h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-[260px]">
                            Kami membutuhkan akses kamera untuk memindai QR code di meja Anda.
                        </p>

                        <button onClick={requestPermission}
                            className="w-full py-4 bg-gradient-to-r from-[#C1121F] to-[#e01f2d] text-white rounded-2xl font-bold text-sm shadow-lg shadow-red-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                            <Camera size={17} /> Izinkan &amp; Buka Kamera
                        </button>
                        <button onClick={() => { stopScanner(); onClose(); }}
                            className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
                            Batalkan
                        </button>
                    </div>
                )}

                {/* ── PHASE: SCANNING ───────────────── */}
                {phase === 'scanning' && (
                    <div className="px-5 pb-6">
                        {/* Viewfinder */}
                        <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '1' }}>

                            {/* Video stream dari html5-qrcode */}
                            <div id="qr-video-container" className="w-full h-full [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&_video]:!absolute [&_video]:!top-0 [&_video]:!left-0" />

                            {/* Corner guide overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="relative w-52 h-52">
                                    {/* Lines */}
                                    <span className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-white rounded-tl-lg" style={{ borderWidth: 3 }} />
                                    <span className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-white rounded-tr-lg" style={{ borderWidth: 3 }} />
                                    <span className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-white rounded-bl-lg" style={{ borderWidth: 3 }} />
                                    <span className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-white rounded-br-lg" style={{ borderWidth: 3 }} />
                                    {/* Scan line animation */}
                                    <span className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#C1121F] to-transparent animate-scan-line"
                                        style={{ position: 'absolute' }} />
                                </div>
                            </div>

                            {/* Dim outside frame */}
                            <div className="absolute inset-0 pointer-events-none"
                                style={{ boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.45)' }}>
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 bg-transparent" />
                            </div>
                        </div>

                        {/* Hint & controls */}
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-gray-500 flex-1">
                                Posisikan QR code dalam bingkai merah
                            </p>
                            {cameras.length > 1 && (
                                <button onClick={switchCamera}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#C1121F] hover:text-[#a50f1a] transition-colors px-3 py-2 bg-red-50 rounded-xl">
                                    <SwitchCamera size={14} /> Ganti Kamera
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── PHASE: ERROR ──────────────────── */}
                {phase === 'error' && (
                    <div className="px-5 pb-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-4 mt-2">
                            <AlertCircle size={36} className="text-[#C1121F]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-base mb-2">Kamera Tidak Dapat Dibuka</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-[270px]">{errorMsg}</p>

                        {/* Panduan setting */}
                        <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left mb-5">
                            <p className="text-xs font-bold text-amber-800 mb-2">Cara mengizinkan kamera:</p>
                            <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                                <li>Klik ikon 🔒 di address bar browser</li>
                                <li>Temukan bagian <strong>Kamera</strong></li>
                                <li>Ubah ke <strong>Izinkan</strong></li>
                                <li>Muat ulang halaman</li>
                            </ol>
                        </div>

                        <button onClick={requestPermission}
                            className="w-full py-4 bg-[#C1121F] text-white rounded-2xl font-bold text-sm hover:bg-[#a50f1a] transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2">
                            <RefreshCw size={15} /> Coba Lagi
                        </button>
                        <button onClick={() => { stopScanner(); onClose(); }}
                            className="mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
                            Tutup
                        </button>
                    </div>
                )}

                {/* ── PHASE: SUCCESS ────────────────── */}
                {phase === 'success' && (
                    <div className="px-5 pb-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-4 mt-2">
                            <CheckCircle size={40} className="text-green-500" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-base mb-1">QR Code Terdeteksi!</h3>
                        <p className="text-gray-400 text-sm mb-2">Nomor meja berhasil dibaca</p>
                        <div className="text-3xl font-extrabold text-[#C1121F] font-mono bg-red-50 px-8 py-2 rounded-2xl">
                            Meja {scannedTable}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
