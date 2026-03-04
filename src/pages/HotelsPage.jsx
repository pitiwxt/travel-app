import { useState, useContext, useEffect, useRef } from 'react';
import { TravelContext } from '../App';
import { locationCoords } from '../data/travelData';

function HotelMap({ kyotoHotel, osakaHotel }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);

    useEffect(() => {
        if (!window.L || !mapRef.current) return;
        const L = window.L;
        if (!leafletMapRef.current) {
            const map = L.map(mapRef.current, { zoomControl: true }).setView([35.0116, 135.7681], 9);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd', maxZoom: 20,
            }).addTo(map);
            leafletMapRef.current = map;
        }
        const map = leafletMapRef.current;
        map.eachLayer(layer => { if (layer._latlng) map.removeLayer(layer); });

        const addPin = (hotel, city, color) => {
            const pos = locationCoords[hotel.name];
            if (!pos) return;
            const icon = L.divIcon({
                html: `<div style="background:${color};color:white;padding:4px 10px;border-radius:14px;font-size:12px;font-weight:700;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);white-space:nowrap;">🏨 ${city}</div>`,
                className: '', iconAnchor: [0, 12], popupAnchor: [70, -14],
            });
            L.marker(pos, { icon }).addTo(map).bindPopup(`
        <div style="font-family:'Noto Sans Thai',sans-serif;min-width:190px;">
          <div style="font-size:13px;font-weight:700;margin-bottom:4px;">${hotel.name}</div>
          <div style="font-size:11px;color:#888;">${hotel.type} · ⭐${'★'.repeat(hotel.stars)}</div>
          <div style="font-size:13px;font-weight:600;color:#d4a843;margin-top:6px;">¥${hotel.priceYen.toLocaleString()}/คืน</div>
          <a href="https://www.google.com/maps/search/${encodeURIComponent(hotel.name + ' Japan')}" target="_blank"
            style="font-size:11px;display:inline-block;margin-top:8px;background:#4285f4;color:white;padding:4px 8px;border-radius:4px;text-decoration:none;">
            📍 Google Maps
          </a>
        </div>
      `);
        };
        addPin(kyotoHotel, 'เกียวโต', '#e8334a');
        addPin(osakaHotel, 'โอซาก้า', '#3b82f6');
        setTimeout(() => map.invalidateSize(), 100);
    }, [kyotoHotel, osakaHotel]);

    return <div ref={mapRef} style={{ height: 240, width: '100%', borderRadius: 10, overflow: 'hidden' }} />;
}

function HotelCard({ hotel, isSelected, onSelect, nights }) {
    return (
        <div
            onClick={() => onSelect(hotel)}
            style={{
                background: isSelected ? 'rgba(232,51,74,0.08)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'var(--accent-red)' : 'var(--border)'}`,
                borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
            }}
        >
            {isSelected && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--accent-red)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
                    ✓ เลือกแล้ว
                </div>
            )}
            <div style={{ fontSize: 10, color: 'var(--accent-teal)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{hotel.city}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, paddingRight: isSelected ? 70 : 0 }}>{hotel.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{hotel.type} · {'⭐'.repeat(Math.min(hotel.stars, 5))}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>✨ {hotel.highlight}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {hotel.tags.map(t => (
                    <span key={t} style={{ fontSize: 10, background: 'rgba(56,178,172,0.1)', color: 'var(--accent-teal)', border: '1px solid rgba(56,178,172,0.2)', padding: '2px 7px', borderRadius: 20 }}>{t}</span>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)' }}>¥{hotel.priceYen.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>/คืน</span>
                    {nights && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{nights} คืน = ¥{(hotel.priceYen * nights).toLocaleString()}</div>}
                </div>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(hotel.name + ' Japan')}`} target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: 11, background: 'rgba(56,178,172,0.1)', color: 'var(--accent-teal)', border: '1px solid rgba(56,178,172,0.2)', padding: '4px 8px', borderRadius: 6, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    📍 Maps
                </a>
            </div>
        </div>
    );
}

function SearchHotelModal({ city, onAdd, onClose }) {
    const [form, setForm] = useState({ city, name: '', type: 'Business Hotel', stars: 3, priceYen: 8000, priceBaht: 2000, highlight: '', tags: '' });
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>➕ เพิ่มโรงแรมใหม่ ({city})</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label className="form-label">ชื่อโรงแรม</label>
                        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="เช่น Hotel Granvia Kyoto" />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">ประเภท</label>
                            <input className="form-input" value={form.type} onChange={e => set('type', e.target.value)} placeholder="Business Hotel" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">ดาว</label>
                            <input className="form-input" type="number" min="1" max="5" value={form.stars} onChange={e => set('stars', parseInt(e.target.value))} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">ราคา/คืน (¥)</label>
                            <input className="form-input" type="number" value={form.priceYen} onChange={e => { const y = parseInt(e.target.value) || 0; set('priceYen', y); set('priceBaht', Math.round(y / 4)); }} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">ราคา/คืน (฿)</label>
                            <input className="form-input" type="number" value={form.priceBaht} onChange={e => set('priceBaht', parseInt(e.target.value) || 0)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">จุดเด่น</label>
                        <input className="form-input" value={form.highlight} onChange={e => set('highlight', e.target.value)} placeholder="เช่น ใกล้สถานี วิวสวย" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">แท็ก (คั่นด้วยจุลภาค)</label>
                        <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="เช่น ออนเซ็น,ใกล้MRT" />
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
                    <button className="btn btn-primary" onClick={() => { onAdd({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }); onClose(); }}>
                        ➕ เพิ่มโรงแรม
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function HotelsPage() {
    const { allHotels, hotelSelection, selectHotel, updateHotelNights, addCustomHotel, hotelExpense } = useContext(TravelContext);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(null); // 'เกียวโต' | 'โอซาก้า' | null
    const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);
    const [tab, setTab] = useState('เกียวโต');

    useEffect(() => {
        if (window.L) { setLeafletLoaded(true); return; }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.onload = () => setLeafletLoaded(true);
        document.head.appendChild(s);
    }, []);

    const filteredHotels = allHotels.filter(h =>
        h.city === tab &&
        (search === '' ||
            h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.highlight.toLowerCase().includes(search.toLowerCase()) ||
            h.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    );

    const sel = tab === 'เกียวโต' ? hotelSelection.kyoto : hotelSelection.osaka;

    return (
        <div className="fade-in page-wrapper">
            <div className="page-header">
                <div>
                    <h2>🏨 ที่พัก</h2>
                    <p>เลือกโรงแรม → แผนและค่าใช้จ่ายจะอัปเดตทันที</p>
                </div>
                <div className="header-actions">
                    <div style={{ fontSize: 13, color: 'var(--accent-gold)', marginRight: 8 }}>
                        ค่าที่พักรวม: ¥{hotelExpense.yen.toLocaleString()} · ฿{hotelExpense.baht.toLocaleString()}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(tab)}>
                        ➕ เพิ่มโรงแรม
                    </button>
                </div>
            </div>

            <div className="page-body fade-in">
                {/* Mini map */}
                {leafletLoaded && (
                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="card-header">
                            <span>📍</span>
                            <div className="card-title">ตำแหน่งโรงแรมที่เลือก</div>
                            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
                                🔴 เกียวโต &nbsp; 🔵 โอซาก้า
                            </div>
                        </div>
                        <HotelMap
                            kyotoHotel={hotelSelection.kyoto.hotel}
                            osakaHotel={hotelSelection.osaka.hotel}
                        />
                    </div>
                )}

                {/* Selected summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    {['เกียวโต', 'โอซาก้า'].map(city => {
                        const s = city === 'เกียวโต' ? hotelSelection.kyoto : hotelSelection.osaka;
                        return (
                            <div key={city} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontSize: 11, color: 'var(--accent-teal)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{city} – ที่เลือก</div>
                                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.hotel.name}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>¥{s.hotel.priceYen.toLocaleString()}/คืน</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>จำนวนคืน:</label>
                                    <input
                                        type="number" min="1" max="14"
                                        value={s.nights}
                                        onChange={e => updateHotelNights(city === 'เกียวโต' ? 'kyoto' : 'osaka', parseInt(e.target.value) || 1)}
                                        style={{ width: 60, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: 'var(--accent-gold)' }}>
                                    รวม: ¥{(s.hotel.priceYen * s.nights).toLocaleString()} · ฿{(s.hotel.priceBaht * s.nights).toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Tab + Search */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    {['เกียวโต', 'โอซาก้า'].map(c => (
                        <button key={c} className={`day-tab ${tab === c ? 'active' : ''}`} onClick={() => setTab(c)}>
                            {c === 'เกียวโต' ? '🏯' : '🏙️'} {c}
                        </button>
                    ))}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <input
                            className="form-input"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={`🔍 ค้นหาโรงแรมใน${tab}...`}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                {/* Hotel grid */}
                <div className="hotel-grid">
                    {filteredHotels.map(h => (
                        <HotelCard
                            key={h.id}
                            hotel={h}
                            isSelected={sel.hotel.id === h.id}
                            nights={sel.nights}
                            onSelect={(hotel) => selectHotel(tab === 'เกียวโต' ? 'kyoto' : 'osaka', hotel, sel.nights)}
                        />
                    ))}
                    {filteredHotels.length === 0 && (
                        <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                            <div className="empty-state-emoji">🏨</div>
                            <div className="empty-state-text">ไม่พบโรงแรมที่ตรงกับการค้นหา</div>
                            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setShowAddModal(tab)}>
                                ➕ เพิ่มโรงแรมใหม่
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <SearchHotelModal
                    city={showAddModal}
                    onAdd={addCustomHotel}
                    onClose={() => setShowAddModal(null)}
                />
            )}
        </div>
    );
}
