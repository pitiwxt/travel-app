import { useState, useContext } from 'react';
import { TravelContext } from '../MainApp';
import { dayTitles, locationCoords } from '../data/travelData';
import EditModal from '../components/EditModal';

export default function DayDetailPage() {
    const { plan, updateItem, addItem, deleteItem, selectedDay, setSelectedDay } = useContext(TravelContext);
    const [editingIdx, setEditingIdx] = useState(null);
    const [showAdd, setShowAdd] = useState(false);

    const dayItems = plan
        .map((item, idx) => ({ ...item, globalIdx: idx }))
        .filter(item => item.day === selectedDay);

    const info = dayTitles[selectedDay];

    // recalculate from live plan
    const liveCost = dayItems.reduce((s, i) => ({ yen: s.yen + i.costYen, baht: s.baht + i.costBaht }), { yen: 0, baht: 0 });

    const openGMaps = (item) => {
        const q = encodeURIComponent(item.place + ' Japan');
        window.open(`https://www.google.com/maps/search/${q}`, '_blank');
    };

    return (
        <>
            {/* Day tabs */}
            <div className="day-detail-nav">
                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <button
                        key={d}
                        className={`day-tab ${selectedDay === d ? 'active' : ''}`}
                        onClick={() => setSelectedDay(d)}
                    >
                        {dayTitles[d].emoji} วันที่ {d}
                    </button>
                ))}
            </div>

            <div className="page-header">
                <div>
                    <h2>{info.title}</h2>
                    <p>{info.subtitle}</p>
                </div>
                <div className="header-actions">
                    <div style={{ fontSize: 13, color: 'var(--accent-gold)', marginRight: 8 }}>
                        ¥{liveCost.yen.toLocaleString()} · ฿{liveCost.baht.toLocaleString()}
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                        + เพิ่มกิจกรรม
                    </button>
                </div>
            </div>

            <div className="page-body fade-in">
                <div className="card">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="schedule-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 100 }}>เวลา</th>
                                    <th style={{ width: 180 }}>สถานที่</th>
                                    <th>กิจกรรม</th>
                                    <th style={{ width: 130 }}>การเดินทาง</th>
                                    <th style={{ width: 110, textAlign: 'right' }}>ค่าใช้จ่าย</th>
                                    <th style={{ width: 110 }}>แผนที่</th>
                                    <th style={{ width: 80 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {dayItems.map((item, i) => (
                                    <tr key={item.globalIdx}>
                                        <td className="time-cell">🕐 {item.time}</td>
                                        <td className="place-cell">
                                            {item.place}
                                            {item.note && <div className="note-badge">{item.note}</div>}
                                        </td>
                                        <td className="activity-cell">{item.activity}</td>
                                        <td>
                                            <span className="tag-transport">{item.transport}</span>
                                        </td>
                                        <td className="cost-cell">
                                            {item.costYen > 0 ? (
                                                <>
                                                    <span className="cost-yen">¥{item.costYen.toLocaleString()}</span>
                                                    <span className="cost-baht">฿{item.costBaht.toLocaleString()}</span>
                                                </>
                                            ) : (
                                                <span className="cost-zero">–</span>
                                            )}
                                        </td>
                                        <td>
                                            <button className="maps-btn" onClick={() => openGMaps(item)}>
                                                📍 Google Maps
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 4 }}>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => setEditingIdx(item.globalIdx)}
                                                >✏️</button>
                                                <button
                                                    className="btn btn-sm"
                                                    style={{ background: 'rgba(232,51,74,0.15)', color: 'var(--accent-red)', border: '1px solid rgba(232,51,74,0.25)' }}
                                                    onClick={() => { if (window.confirm('ลบกิจกรรมนี้?')) deleteItem(item.globalIdx); }}
                                                >🗑</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ค่าใช้จ่ายวันนี้ (เยน)</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-gold)' }}>¥{liveCost.yen.toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ค่าใช้จ่ายวันนี้ (บาท)</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>฿{liveCost.baht.toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>จำนวนกิจกรรม</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-teal)' }}>{dayItems.length} รายการ</div>
                    </div>
                </div>
            </div>

            {editingIdx !== null && (
                <EditModal
                    item={plan[editingIdx]}
                    onSave={(updated) => { updateItem(editingIdx, updated); setEditingIdx(null); }}
                    onClose={() => setEditingIdx(null)}
                    title="แก้ไขกิจกรรม"
                />
            )}

            {showAdd && (
                <EditModal
                    item={{ day: selectedDay, time: '', place: '', activity: '', transport: 'เดิน', costYen: 0, costBaht: 0, mapsUrl: '', note: '' }}
                    onSave={(newItem) => { addItem(newItem); setShowAdd(false); }}
                    onClose={() => setShowAdd(false)}
                    title="เพิ่มกิจกรรมใหม่"
                    isNew
                />
            )}
        </>
    );
}
