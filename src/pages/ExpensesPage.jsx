import { useContext, useState } from 'react';
import { TravelContext } from '../App';

const COLORS = ['#e8334a', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];

export default function ExpensesPage() {
    const { plan, hotelSelection, hotelExpense, navTo, customExpenses, updateCustomExpense } = useContext(TravelContext);
    const [editingIdx, setEditingIdx] = useState(null);
    const [editVal, setEditVal] = useState('');

    // Live activity costs from plan
    const activityCostYen = plan.reduce((s, i) => s + i.costYen, 0);
    const activityCostBaht = plan.reduce((s, i) => s + i.costBaht, 0);

    // Fixed expenses (transport, food, entrance)
    const fixedYen = customExpenses.reduce((s, e) => s + e.totalYen, 0);
    const fixedBaht = customExpenses.reduce((s, e) => s + e.totalBaht, 0);

    const grandTotalYen = fixedYen + hotelExpense.yen;
    const grandTotalBaht = fixedBaht + hotelExpense.baht;

    // All rows for chart
    const allRows = [
        ...customExpenses.map((e, idx) => ({ ...e, originalIdx: idx })),
        {
            item: `ที่พักเกียวโต ${hotelSelection.kyoto.nights} คืน`,
            detail: hotelSelection.kyoto.hotel.name,
            totalYen: hotelSelection.kyoto.hotel.priceYen * hotelSelection.kyoto.nights,
            totalBaht: hotelSelection.kyoto.hotel.priceBaht * hotelSelection.kyoto.nights,
            isHotel: true,
        },
        {
            item: `ที่พักโอซาก้า ${hotelSelection.osaka.nights} คืน`,
            detail: hotelSelection.osaka.hotel.name,
            totalYen: hotelSelection.osaka.hotel.priceYen * hotelSelection.osaka.nights,
            totalBaht: hotelSelection.osaka.hotel.priceBaht * hotelSelection.osaka.nights,
            isHotel: true,
        },
    ];
    const maxVal = Math.max(...allRows.map(e => e.totalBaht), 1);

    return (
        <div className="fade-in page-wrapper">
            <div className="page-header">
                <div>
                    <h2>💴 ค่าใช้จ่ายรวม</h2>
                    <p>คำนวณสดจากโรงแรมที่เลือกและกิจกรรมในแผน</p>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent-gold)' }}>¥{grandTotalYen.toLocaleString()}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>≈ ฿{grandTotalBaht.toLocaleString()}</div>
                </div>
            </div>

            <div className="page-body fade-in">
                {/* Stats */}
                <div className="stats-row">
                    <div className="stat-card gold">
                        <div className="stat-emoji">💴</div>
                        <div className="stat-label">รวมทั้งหมด (เยน)</div>
                        <div className="stat-value">¥{grandTotalYen.toLocaleString()}</div>
                        <div className="stat-sub">≈ ฿{grandTotalBaht.toLocaleString()}</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-emoji">🏨</div>
                        <div className="stat-label">ค่าที่พัก</div>
                        <div className="stat-value">¥{hotelExpense.yen.toLocaleString()}</div>
                        <div className="stat-sub">
                            เกียวโต {hotelSelection.kyoto.nights} + โอซาก้า {hotelSelection.osaka.nights} คืน
                            <br />
                            <span
                                style={{ color: 'var(--accent-teal)', cursor: 'pointer' }}
                                onClick={() => navTo('hotels')}
                            >
                                🔄 เปลี่ยนโรงแรม →
                            </span>
                        </div>
                    </div>
                    <div className="stat-card teal">
                        <div className="stat-emoji">🍜</div>
                        <div className="stat-label">ค่าอาหาร (ประมาณ)</div>
                        <div className="stat-value">¥50,000</div>
                        <div className="stat-sub">6 วัน เช้า-กลาง-เย็น</div>
                    </div>
                    <div className="stat-card sakura">
                        <div className="stat-emoji">🚆</div>
                        <div className="stat-label">ค่าเดินทาง</div>
                        <div className="stat-value">¥{(customExpenses.slice(0, 6).reduce((s, e) => s + e.totalYen, 0)).toLocaleString()}</div>
                        <div className="stat-sub">รถไฟ บัส JR</div>
                    </div>
                </div>

                {/* Hotel notice */}
                <div style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>💡</span>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        ค่าที่พักคำนวณจากโรงแรมที่เลือก:
                        <strong style={{ color: 'var(--accent-gold)' }}> {hotelSelection.kyoto.hotel.name}</strong> ({hotelSelection.kyoto.nights} คืน) +
                        <strong style={{ color: 'var(--accent-gold)' }}> {hotelSelection.osaka.hotel.name}</strong> ({hotelSelection.osaka.nights} คืน)
                        <span style={{ color: 'var(--accent-teal)', cursor: 'pointer', marginLeft: 8 }} onClick={() => navTo('hotels')}>เปลี่ยนโรงแรม →</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Bar chart */}
                    <div className="card">
                        <div className="card-header"><span>📊</span><div className="card-title">สัดส่วนค่าใช้จ่าย</div></div>
                        <div className="card-body">
                            <div className="expense-chart">
                                {allRows.map((e, i) => (
                                    <div key={i} className="expense-bar-item">
                                        <div className="expense-bar-label" title={e.item}>
                                            {e.isHotel && '🏨 '}{e.item}
                                        </div>
                                        <div className="expense-bar-track">
                                            <div className="expense-bar-fill" style={{ width: `${(e.totalBaht / maxVal) * 100}%`, background: e.isHotel ? '#d4a843' : COLORS[i % COLORS.length] }} />
                                        </div>
                                        <div className="expense-bar-val">฿{e.totalBaht.toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card">
                        <div className="card-header"><span>📋</span><div className="card-title">รายการค่าใช้จ่าย</div></div>
                        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 380 }}>
                            <table className="expense-table">
                                <thead>
                                    <tr>
                                        <th>รายการ</th>
                                        <th>รายละเอียด</th>
                                        <th style={{ textAlign: 'right' }}>เยน</th>
                                        <th style={{ textAlign: 'right' }}>บาท</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allRows.map((e, i) => (
                                        <tr key={i}>
                                            <td style={{ color: 'var(--text-primary)', fontWeight: e.isHotel ? 600 : 400 }}>
                                                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: e.isHotel ? '#d4a843' : COLORS[i % COLORS.length], marginRight: 8 }} />
                                                {e.item}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{e.detail}</td>
                                            <td style={{ textAlign: 'right', color: 'var(--accent-gold)', fontWeight: 600, position: 'relative' }}>
                                                {editingIdx === i && e.originalIdx !== undefined ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                                                        <span style={{ color: 'var(--text-primary)' }}>¥</span>
                                                        <input
                                                            type="number"
                                                            autoFocus
                                                            style={{ width: 70, background: 'var(--bg-secondary)', border: '1px solid var(--accent-gold)', color: 'white', padding: '2px 4px', borderRadius: 4, textAlign: 'right' }}
                                                            value={editVal}
                                                            onChange={(ev) => setEditVal(ev.target.value)}
                                                            onKeyDown={(ev) => {
                                                                if (ev.key === 'Enter') {
                                                                    updateCustomExpense(e.originalIdx, Number(editVal) || 0);
                                                                    setEditingIdx(null);
                                                                } else if (ev.key === 'Escape') setEditingIdx(null);
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => { updateCustomExpense(e.originalIdx, Number(editVal) || 0); setEditingIdx(null); }}
                                                            style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', fontWeight: 'bold' }}
                                                        >✓</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                                                        <span>¥{e.totalYen.toLocaleString()}</span>
                                                        {e.originalIdx !== undefined && (
                                                            <button
                                                                onClick={() => { setEditingIdx(i); setEditVal(e.totalYen); }}
                                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 11 }}
                                                                title="แก้ไข"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>฿{e.totalBaht.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    <tr className="expense-total-row">
                                        <td colSpan={2} style={{ color: 'var(--accent-gold)' }}>รวมทั้งสิ้น</td>
                                        <td style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>¥{grandTotalYen.toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', color: 'var(--accent-gold)' }}>฿{grandTotalBaht.toLocaleString()}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="card" style={{ marginTop: 20 }}>
                    <div className="card-header"><span>💡</span><div className="card-title">เคล็ดลับประหยัดเงิน</div></div>
                    <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                        {[
                            { emoji: '🚌', tip: 'ใช้บัตร ICOCA แทนซื้อตั๋วรายเที่ยว ประหยัดและสะดวกกว่า' },
                            { emoji: '🍱', tip: 'อาหารกลางวันร้านท้องถิ่นถูกกว่าร้านในแหล่งท่องเที่ยว' },
                            { emoji: '🎟️', tip: 'ซื้อตั๋วรวม Combination Ticket เข้าวัดหลายแห่งพร้อมกัน' },
                            { emoji: '⏰', tip: 'ไปสถานที่ยอดนิยมช่วงเช้าตรู่ คนน้อย ไม่ต้องเสียเวลารอ' },
                        ].map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 20, flexShrink: 0 }}>{t.emoji}</span>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.tip}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
