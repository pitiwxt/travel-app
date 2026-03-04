import { useContext } from 'react';
import { TravelContext } from '../App';
import { dayTitles } from '../data/travelData';

export default function OverviewPage() {
    const { plan, hotelExpense, navTo } = useContext(TravelContext);

    // Compute stats live from plan
    const totalPlanYen = plan.reduce((s, i) => s + i.costYen, 0);
    const totalPlanBaht = plan.reduce((s, i) => s + i.costBaht, 0);
    const fixedBaht = 17734;
    const totalBaht = fixedBaht + hotelExpense.baht;
    const totalYen = fixedBaht * 4 + hotelExpense.yen;
    const totalStops = plan.length;

    const getDayItems = (day) => plan.filter(i => i.day === day);
    const getDayCostLive = (day) => {
        const items = getDayItems(day);
        return { yen: items.reduce((s, i) => s + i.costYen, 0), baht: items.reduce((s, i) => s + i.costBaht, 0) };
    };

    return (
        <>
            <div className="page-header fade-in">
                <div>
                    <h2>แผนการเดินทาง</h2>
                    <p>เกียวโต・โอซาก้า 7 วัน</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => navTo('map')}>📍 ดูแผนที่</button>
                    <button className="btn btn-primary" onClick={() => navTo('day', 1)}>✏️ แก้ไขแผน</button>
                </div>
            </div>

            <div className="page-body">
                {/* Hero */}
                <div className="overview-hero slide-up">
                    <h1>🗾 แผนการเดินทาง เกียวโต・โอซาก้า</h1>
                    <p>กำหนดการเดินทางทั้งหมด 7 วัน – สามารถเช็คราคาสดๆ และแก้ไขได้ทุกเวลา</p>
                    <div className="overview-meta">
                        <div className="overview-meta-item">📅 <strong>7–13 มีนาคม 2026</strong></div>
                        <div className="overview-meta-item">🏨 <strong>เกียวโต 5 คืน + โอซาก้า 1 คืน</strong></div>
                        <div className="overview-meta-item">✈️ <strong>สนามบินคันไซ (KIX)</strong></div>
                    </div>
                </div>

                {/* Yen Rate Chart */}
                <div className="Exchange-Chart slide-up stagger-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 24 }}>💴</span>
                            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>อัตราแลกเปลี่ยนปัจจุบัน</h3>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-gold)', marginBottom: 4, fontFamily: 'monospace' }}>
                            100¥ = 25.00฿
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>▲ +0.12%</span> อัปเดตล่าสุด: วันนี้ 09:45
                        </div>
                        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            ระบบจะคำนวณเงินบาทในตารางตามอัตราแลกเปลี่ยน 1 เยน = 0.25 บาท โดยอัตโนมัติ
                        </div>
                    </div>
                    {/* SVG mini chart */}
                    <div style={{ width: 140, height: 60, position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 140 60" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(212, 168, 67, 0.4)" />
                                    <stop offset="100%" stopColor="rgba(212, 168, 67, 0)" />
                                </linearGradient>
                            </defs>
                            <path d="M0,50 L20,40 L40,45 L60,30 L80,35 L100,20 L120,25 L140,10 L140,60 L0,60 Z" fill="url(#chartGrad)" />
                            <path d="M0,50 L20,40 L40,45 L60,30 L80,35 L100,20 L120,25 L140,10" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="140" cy="10" r="4" fill="var(--bg-card)" stroke="var(--accent-gold)" strokeWidth="2" />
                        </svg>
                    </div>
                </div>

                {/* Stats */}
                <div className="stats-row slide-up stagger-1">
                    <div className="stat-card red">
                        <div className="stat-emoji">📍</div>
                        <div className="stat-label">สถานที่ทั้งหมด</div>
                        <div className="stat-value">{totalStops}</div>
                        <div className="stat-sub">กิจกรรมใน 7 วัน</div>
                    </div>
                    <div className="stat-card gold">
                        <div className="stat-emoji">💴</div>
                        <div className="stat-label">งบประมาณ (เยน)</div>
                        <div className="stat-value">¥{totalYen.toLocaleString()}</div>
                        <div className="stat-sub">≈ ฿{totalBaht.toLocaleString()}</div>
                    </div>
                    <div className="stat-card teal">
                        <div className="stat-emoji">🏨</div>
                        <div className="stat-label">ที่พัก</div>
                        <div className="stat-value">6 คืน</div>
                        <div className="stat-sub">เกียวโต + โอซาก้า</div>
                    </div>
                    <div className="stat-card sakura">
                        <div className="stat-emoji">🗓️</div>
                        <div className="stat-label">ระยะเวลา</div>
                        <div className="stat-value">7 วัน</div>
                        <div className="stat-sub">7–13 มีนาคม 2026</div>
                    </div>
                </div>

                {/* Day cards */}
                <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                    แผนรายวัน
                </div>
                <div className="day-grid slide-up stagger-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((d, index) => {
                        const info = dayTitles[d];
                        const cost = getDayCostLive(d);
                        const items = getDayItems(d);
                        const uniquePlaces = [...new Set(items.map(i => i.place))].slice(0, 5);
                        return (
                            <div key={d} className="day-card stagger-3" style={{ animationDelay: `${(index + 2) * 0.05}s` }} onClick={() => navTo('day', d)}>
                                <div className="day-card-header">
                                    <div className="day-emoji">{info.emoji}</div>
                                    <div>
                                        <div className="day-card-title">{info.title}</div>
                                        <div className="day-card-sub">{info.subtitle}</div>
                                    </div>
                                </div>
                                <div className="day-card-body">
                                    <div className="day-places">
                                        {uniquePlaces.map(p => (
                                            <span key={p} className="day-place-tag">{p}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="day-card-footer">
                                    <div>
                                        {cost.yen > 0 ? (
                                            <>
                                                <div className="day-cost-yen">¥{cost.yen.toLocaleString()}</div>
                                                <div className="day-cost-baht">฿{cost.baht.toLocaleString()}</div>
                                            </>
                                        ) : (
                                            <div className="day-cost-baht">ไม่มีค่าใช้จ่าย</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="day-items-count">{items.length} กิจกรรม</div>
                                        <div style={{ fontSize: 11, color: 'var(--accent-red)', marginTop: 2 }}>ดูรายละเอียด →</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
