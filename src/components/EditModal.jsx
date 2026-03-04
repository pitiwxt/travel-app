import { useState } from 'react';
import { placesDatabase, locationCoords } from '../data/travelData';

export default function EditModal({ item, onSave, onClose, title, isNew = false }) {
    const [form, setForm] = useState({ ...item });
    const [placeSearch, setPlaceSearch] = useState('');
    const [showPlaceSearch, setShowPlaceSearch] = useState(false);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    // Filter places by search
    const filteredPlaces = placeSearch.length >= 1
        ? placesDatabase.filter(p =>
            p.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
            p.type.toLowerCase().includes(placeSearch.toLowerCase()) ||
            p.city.toLowerCase().includes(placeSearch.toLowerCase())
        ).slice(0, 8)
        : [];

    const selectPlace = (place) => {
        set('place', place.name);
        setPlaceSearch('');
        setShowPlaceSearch(false);
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="modal-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">เวลา (เช่น 09:00-10:00)</label>
                            <input className="form-input" value={form.time} onChange={e => set('time', e.target.value)} placeholder="09:00-10:00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">วันที่ (1-7)</label>
                            <input className="form-input" type="number" min="1" max="7" value={form.day} onChange={e => set('day', parseInt(e.target.value))} />
                        </div>
                    </div>

                    {/* Place search */}
                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">
                            สถานที่
                            <span
                                style={{ cursor: 'pointer', color: 'var(--accent-teal)', marginLeft: 8, fontSize: 11 }}
                                onClick={() => setShowPlaceSearch(v => !v)}
                            >
                                {showPlaceSearch ? '✕ ปิด' : '🔍 ค้นหาสถานที่'}
                            </span>
                        </label>
                        <input
                            className="form-input"
                            value={form.place}
                            onChange={e => set('place', e.target.value)}
                            placeholder="ชื่อสถานที่"
                        />
                        {showPlaceSearch && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, marginTop: 4 }}>
                                <input
                                    className="form-input"
                                    value={placeSearch}
                                    onChange={e => setPlaceSearch(e.target.value)}
                                    placeholder="พิมพ์ชื่อสถานที่ เช่น Kinkaku, ปราสาท…"
                                    autoFocus
                                    style={{ borderBottomLeftRadius: filteredPlaces.length ? 0 : undefined, borderBottomRightRadius: filteredPlaces.length ? 0 : undefined }}
                                />
                                {filteredPlaces.length > 0 && (
                                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                                        {filteredPlaces.map((p, i) => (
                                            <div
                                                key={i}
                                                onClick={() => selectPlace(p)}
                                                style={{ padding: '9px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(42,58,85,0.4)', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = ''}
                                            >
                                                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{p.name}</div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.city} · {p.type}</div>
                                                </div>
                                                {locationCoords[p.name] && (
                                                    <span style={{ fontSize: 10, color: 'var(--accent-teal)', background: 'rgba(56,178,172,0.1)', padding: '2px 6px', borderRadius: 10 }}>📍 มีพิกัด</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {placeSearch.length >= 1 && filteredPlaces.length === 0 && (
                                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                                        ไม่พบสถานที่ — พิมพ์ชื่อที่ต้องการในช่องด้านบนได้เลย
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">กิจกรรม</label>
                        <input className="form-input" value={form.activity} onChange={e => set('activity', e.target.value)} placeholder="รายละเอียดกิจกรรม" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">การเดินทาง</label>
                        <input className="form-input" value={form.transport} onChange={e => set('transport', e.target.value)} placeholder="เช่น เดิน, รถบัส, รถไฟ" />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">ค่าใช้จ่าย ¥ (เยน)</label>
                            <input
                                className="form-input"
                                type="number" min="0"
                                value={form.costYen}
                                onChange={e => {
                                    const yen = parseInt(e.target.value) || 0;
                                    set('costYen', yen);
                                    set('costBaht', Math.round(yen / 4));
                                }}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">ค่าใช้จ่าย ฿ (บาท)</label>
                            <input
                                className="form-input"
                                type="number" min="0"
                                value={form.costBaht}
                                onChange={e => {
                                    const baht = parseInt(e.target.value) || 0;
                                    set('costBaht', baht);
                                    set('costYen', baht * 4);
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">หมายเหตุ</label>
                        <textarea className="form-textarea" value={form.note} onChange={e => set('note', e.target.value)} placeholder="หมายเหตุเพิ่มเติม..." rows={2} />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
                    <button className="btn btn-primary" onClick={() => onSave(form)}>
                        {isNew ? '➕ เพิ่มกิจกรรม' : '💾 บันทึก'}
                    </button>
                </div>
            </div>
        </div>
    );
}
