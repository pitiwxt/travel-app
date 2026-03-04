import { useContext } from 'react';
import { TravelContext } from '../MainApp';
import { dayTitles } from '../data/travelData';

export default function Sidebar({ page, onNav, isOpen, onClose }) {
    const { plan, hotelExpense, navTo, exchangeRate, customExpenses } = useContext(TravelContext);

    // Compute per-day cost live from plan
    const getDayCostLive = (day) => {
        const items = plan.filter(i => i.day === day);
        return { baht: items.reduce((s, i) => s + Math.round(i.costYen * exchangeRate), 0) };
    };

    // Fixed costs (activities, transport, food) — hotel from context
    const fixedYen = customExpenses.reduce((s, e) => s + e.totalYen, 0);
    const totalYen = fixedYen + hotelExpense.yen;
    const totalBaht = customExpenses.reduce((s, e) => s + Math.round(e.totalYen * exchangeRate), 0) + hotelExpense.baht;

    const handleNav = (p, day) => {
        if (day !== undefined) {
            navTo(p, day);
        } else {
            onNav(p);
        }
        if (onClose) onClose(); // close sidebar on mobile after navigation
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6, zIndex: 10 }}>
                <button className="sidebar-close-btn" onClick={onClose} style={{ position: 'relative', top: 0, right: 0 }}>✕</button>
            </div>

            <div className="sidebar-logo">
                <img src="/logo.png" style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} alt="Japan Logo" />
                <h1 style={{ fontSize: 15 }}>เกียวโต・โอซาก้า</h1>
                <p style={{ marginTop: 2 }}>7 วัน มีนาคม 2026</p>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section-label">หน้าหลัก</div>
                {[
                    { key: 'overview', emoji: '🗺️', label: 'แผนการเดินทาง' },
                    { key: 'map', emoji: '📍', label: 'แผนที่เส้นทาง' },
                    { key: 'expenses', emoji: '💴', label: 'ค่าใช้จ่าย' },
                    { key: 'hotels', emoji: '🏨', label: 'ที่พัก' },
                    { key: 'places', emoji: '📌', label: 'สถานที่ทั้งหมด' },
                ].map(({ key, emoji, label }) => (
                    <div
                        key={key}
                        className={`nav-item ${page === key ? 'active' : ''}`}
                        onClick={() => handleNav(key)}
                    >
                        <span className="nav-emoji">{emoji}</span>
                        {label}
                    </div>
                ))}

                <div className="sidebar-section-label" style={{ marginTop: 4 }}>รายวัน</div>
                {[1, 2, 3, 4, 5, 6, 7].map(d => {
                    const info = dayTitles[d];
                    const cost = getDayCostLive(d);
                    return (
                        <div
                            key={d}
                            className={`nav-item ${page === 'day' ? 'active' : ''}`}
                            onClick={() => handleNav('day', d)}
                            style={{ fontSize: 12, padding: '7px 20px' }}
                        >
                            <span className="nav-emoji" style={{ fontSize: 14 }}>{info.emoji}</span>
                            <span>วันที่ {d}</span>
                            <span className="nav-badge" style={{ fontSize: 9 }}>฿{cost.baht.toLocaleString()}</span>
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="budget-mini">
                    <div className="budget-mini-label">งบประมาณรวม</div>
                    <div className="budget-mini-yen">¥{totalYen.toLocaleString()}</div>
                    <div className="budget-mini-baht">≈ ฿{totalBaht.toLocaleString()} บาท</div>
                </div>
            </div>
        </div>
    );
}
