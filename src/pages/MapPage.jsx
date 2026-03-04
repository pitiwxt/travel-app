import { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { TravelContext } from '../App';
import { dayTitles, locationCoords } from '../data/travelData';

const DAY_COLORS = {
    1: '#e8334a', 2: '#f59e0b', 3: '#10b981',
    4: '#6366f1', 5: '#ec4899', 6: '#3b82f6', 7: '#8b5cf6'
};

function LeafletMap({ items, selectedDay, onSelectStop, hotelPins }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef([]);
    const polylinesRef = useRef([]);
    const hotelMarkersRef = useRef([]);

    useEffect(() => {
        if (mapRef.current && !leafletMapRef.current) {
            const L = window.L;
            const map = L.map(mapRef.current, { zoomControl: true }).setView([35.0116, 135.7681], 12);
            // CartoDB Voyager — English labels, Google Maps-like colors, free, no API key
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);
            leafletMapRef.current = map;
        }
    }, []);

    // Invalidate map size when container changes (fixes toggle bug)
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map) return;
        setTimeout(() => map.invalidateSize(), 200);
    });

    useEffect(() => {
        const L = window.L;
        const map = leafletMapRef.current;
        if (!map || !L) return;

        markersRef.current.forEach(m => m.remove());
        polylinesRef.current.forEach(p => p.remove());
        markersRef.current = [];
        polylinesRef.current = [];

        const color = DAY_COLORS[selectedDay] || '#e8334a';
        const coords = [];

        items.forEach((item, i) => {
            const pos = locationCoords[item.place];
            if (!pos) return;
            coords.push(pos);
            const itemColor = selectedDay === 'all' ? (DAY_COLORS[item.day] || '#e8334a') : (DAY_COLORS[selectedDay] || '#e8334a');

            const icon = L.divIcon({
                html: `<div style="
          background:${itemColor};color:white;
          width:30px;height:30px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          border:3px solid white;font-size:13px;font-weight:700;
          box-shadow:0 3px 8px rgba(0,0,0,0.35);
          cursor:pointer;
        ">${i + 1}</div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -18],
                className: '',
            });

            const marker = L.marker(pos, { icon })
                .addTo(map)
                .bindPopup(`
          <div style="font-family:'Noto Sans Thai',sans-serif;min-width:210px;padding:4px;">
            <div style="font-size:14px;font-weight:700;margin-bottom:6px;color:#1a2235;">
              <span style="display:inline-block;width:22px;height:22px;background:${itemColor};color:white;border-radius:50%;text-align:center;line-height:22px;font-size:11px;margin-right:6px;">${i + 1}</span>
              ${item.place}
            </div>
            ${item.day ? `<div style="font-size:12px;font-weight:600;color:${itemColor};margin-bottom:4px;">วันที่ ${item.day}</div>` : ''}
            <div style="font-size:12px;color:#555;margin-bottom:3px;">🕐 ${item.time}</div>
            <div style="font-size:12px;color:#333;margin-bottom:3px;">${item.activity}</div>
            <div style="font-size:11px;color:#888;margin-bottom:6px;">🚶 ${item.transport}</div>
            ${item.costYen > 0 ? `<div style="font-size:12px;color:#d4a843;font-weight:600;">¥${item.costYen.toLocaleString()} · ฿${item.costBaht.toLocaleString()}</div>` : ''}
            ${item.note ? `<div style="font-size:11px;color:#666;margin-top:4px;border-top:1px solid #eee;padding-top:4px;">📝 ${item.note}</div>` : ''}
            <div style="margin-top:8px;">
              <a href="https://www.google.com/maps/search/${encodeURIComponent(item.place + ' Japan')}" target="_blank"
                style="font-size:11px;background:#4285f4;color:white;padding:5px 10px;border-radius:5px;text-decoration:none;display:inline-block;">
                📍 เปิด Google Maps
              </a>
            </div>
          </div>
        `);
            marker.on('click', () => onSelectStop(i));
            markersRef.current.push(marker);
        });

        if (coords.length > 1) {
            // If showing 'all' days, we don't draw a single line to connect them all (it would be messy), 
            // except if we want to group by day. Let's just fitBounds if 'all'.
            if (selectedDay !== 'all') {
                const line = L.polyline(coords, { color: (DAY_COLORS[selectedDay] || '#e8334a'), weight: 4, opacity: 0.75, dashArray: '8, 6' }).addTo(map);
                polylinesRef.current.push(line);
            }
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (coords.length === 1) {
            map.setView(coords[0], 15);
        }
    }, [items, selectedDay]);

    // Hotel pins
    useEffect(() => {
        const L = window.L;
        const map = leafletMapRef.current;
        if (!map || !L) return;

        hotelMarkersRef.current.forEach(m => m.remove());
        hotelMarkersRef.current = [];

        hotelPins.forEach(h => {
            const pos = locationCoords[h.name];
            if (!pos) return;
            const icon = L.divIcon({
                html: `<div style="background:#d4a843;color:white;padding:3px 7px;border-radius:12px;font-size:11px;font-weight:700;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);white-space:nowrap;">🏨 ${h.city}</div>`,
                className: '',
                iconAnchor: [0, 10],
                popupAnchor: [60, -10],
            });
            const marker = L.marker(pos, { icon })
                .addTo(map)
                .bindPopup(`
          <div style="font-family:'Noto Sans Thai',sans-serif;min-width:190px;">
            <div style="font-size:13px;font-weight:700;margin-bottom:4px;">🏨 ${h.name}</div>
            <div style="font-size:11px;color:#888;">${h.city} · ${h.nights} คืน</div>
            <div style="font-size:13px;font-weight:600;color:#d4a843;margin-top:6px;">¥${(h.priceYen * h.nights).toLocaleString()}</div>
            <a href="https://www.google.com/maps/search/${encodeURIComponent(h.name + ' Japan')}" target="_blank"
              style="font-size:11px;display:inline-block;margin-top:8px;background:#d4a843;color:white;padding:4px 8px;border-radius:4px;text-decoration:none;">
              📍 Google Maps
            </a>
          </div>
        `);
            hotelMarkersRef.current.push(marker);
        });
    }, [hotelPins]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}

export default function MapPage() {
    const { plan, selectedDay, setSelectedDay, hotelSelection } = useContext(TravelContext);
    const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);
    const [selectedStop, setSelectedStop] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showHotels, setShowHotels] = useState(true);

    useEffect(() => {
        if (window.L) { setLeafletLoaded(true); return; }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setLeafletLoaded(true);
        document.head.appendChild(script);
    }, []);

    const dayItems = useMemo(() => {
        return plan
            .map((item, idx) => ({ ...item, globalIdx: idx }))
            .filter(item => (selectedDay === 'all' || item.day === selectedDay) && locationCoords[item.place]);
    }, [plan, selectedDay]);

    const uniqueStops = useMemo(() => {
        return dayItems.reduce((acc, item) => {
            if (!acc.find(a => a.place === item.place)) acc.push(item);
            return acc;
        }, []);
    }, [dayItems]);

    const hotelPins = useMemo(() => {
        return showHotels ? [
            { ...hotelSelection.kyoto.hotel, nights: hotelSelection.kyoto.nights, city: 'เกียวโต' },
            { ...hotelSelection.osaka.hotel, nights: hotelSelection.osaka.nights, city: 'โอซาก้า' },
        ] : [];
    }, [showHotels, hotelSelection]);

    const info = dayTitles[selectedDay];

    return (
        <div className="fade-in page-wrapper">
            <div className="page-header">
                <div>
                    <h2>📍 แผนที่เส้นทาง</h2>
                    <p>{selectedDay === 'all' ? 'รวมสถานที่ทุกวัน (วันที่ 1-7)' : info?.title}</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn btn-sm ${showHotels ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setShowHotels(v => !v)}
                    >
                        🏨 {showHotels ? 'ซ่อนโรงแรม' : 'แสดงโรงแรม'}
                    </button>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowSidebar(v => !v)}
                    >
                        {showSidebar ? '◀ ซ่อน' : '▶ แสดง'} รายการ
                    </button>
                </div>
            </div>

            <div className="map-layout">
                <div className={`list-sidebar-container ${!showSidebar ? 'collapsed' : ''}`} style={{ width: '320px', flexShrink: 0, height: '100%', borderRight: '1px solid var(--border)' }}>
                    <div className="map-sidebar" style={{ width: '100%', borderRight: 'none' }}>
                        <div className="map-sidebar-header">
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>เลือกวัน</div>
                            <div className="day-selector map-day-selector">
                                <div
                                    className={`day-selector-item ${selectedDay === 'all' ? 'active' : ''}`}
                                    onClick={() => { setSelectedDay('all'); setSelectedStop(0); }}
                                    style={{ background: selectedDay === 'all' ? 'rgba(232, 51, 74, 0.1)' : 'var(--bg-card)' }}
                                >
                                    <span style={{ fontSize: 16 }}>🌍</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>รวมทุกวัน</div>
                                        <div className="day-sel-sub" style={{ fontSize: 10, color: 'var(--text-muted)' }}>สถานที่ทั้งหมดในทริปนี้</div>
                                    </div>
                                </div>
                                {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                    <div
                                        key={d}
                                        className={`day-selector-item ${selectedDay === d ? 'active' : ''}`}
                                        onClick={() => { setSelectedDay(d); setSelectedStop(0); }}
                                    >
                                        <span style={{ fontSize: 16 }}>{dayTitles[d].emoji}</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>วันที่ {d}</div>
                                            <div className="day-sel-sub" style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {dayTitles[d].subtitle}
                                            </div>
                                        </div>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: selectedDay === d ? DAY_COLORS[d] : 'var(--text-muted)', flexShrink: 0 }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '10px 10px 4px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                            {selectedDay === 'all' ? 'สถานที่ทั้งหมด' : `สถานที่วันที่ ${selectedDay}`} ({uniqueStops.length} แห่ง)
                        </div>
                        <div className="map-stop-list">
                            {uniqueStops.map((item, i) => {
                                const stColor = selectedDay === 'all' ? (DAY_COLORS[item.day] || '#e8334a') : DAY_COLORS[selectedDay];
                                return (
                                    <div
                                        key={item.globalIdx}
                                        className={`map-stop-item ${selectedStop === i ? 'active' : ''}`}
                                        onClick={() => setSelectedStop(i)}
                                    >
                                        <div className="stop-num" style={{ background: stColor }}>{i + 1}</div>
                                        <div className="stop-info">
                                            <h4>{item.place}</h4>
                                            {selectedDay === 'all' ? <p style={{ color: stColor, fontSize: 10, fontWeight: 600 }}>วันที่ {item.day}</p> : <p>{item.activity}</p>}
                                            <div className="stop-time">{item.time}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="map-container">
                    {!leafletLoaded ? (
                        <div className="empty-state">
                            <div className="empty-state-emoji">🗺️</div>
                            <div className="empty-state-text">กำลังโหลดแผนที่...</div>
                        </div>
                    ) : (
                        <LeafletMap
                            items={uniqueStops}
                            selectedDay={selectedDay}
                            onSelectStop={setSelectedStop}
                            hotelPins={hotelPins}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
