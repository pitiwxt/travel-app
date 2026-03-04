import { useContext } from 'react';
import { TravelContext } from '../App';
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
            <button className="sidebar-close-btn" onClick={onClose}>✕</button>

            <div className="sidebar-logo">
                <img src="/logo.png" style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} alt="Japan Logo" />
                <h1>เกียวโต・โอซาก้า</h1>
                <p>7 วัน มีนาคม 2026</p>
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

                <div className="sidebar-section-label" style={{ marginTop: 8 }}>รายวัน</div>
                {[1, 2, 3, 4, 5, 6, 7].map(d => {
                    const info = dayTitles[d];
                    const cost = getDayCostLive(d);
                    return (
                        <div
                            key={d}
                            className={`nav-item ${page === 'day' ? 'active' : ''}`}
                            onClick={() => handleNav('day', d)}
                            style={{ fontSize: 12 }}
                        >
                            <span className="nav-emoji">{info.emoji}</span>
                            <span>วันที่ {d}</span>
                            <span className="nav-badge">฿{cost.baht.toLocaleString()}</span>
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
