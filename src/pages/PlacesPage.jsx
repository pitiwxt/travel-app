import { useState, useMemo, useEffect, useRef } from 'react';
import { placesDatabase, locationCoords } from '../data/travelData';

function PlacesLeafletMap({ places, hoveredPlace }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (mapRef.current && !leafletMapRef.current) {
            const L = window.L;
            const map = L.map(mapRef.current, { zoomControl: true }).setView([34.8, 135.5], 9);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);
            leafletMapRef.current = map;
        }
    }, []);

    // Invalidate map size when container changes
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
        markersRef.current = [];

        const coordsForBounds = [];

        places.forEach((place) => {
            const pos = locationCoords[place.name];
            if (!pos) return;
            coordsForBounds.push(pos);

            const isHovered = hoveredPlace === place.name;
            const zIndex = isHovered ? 1000 : 0;
            const scale = isHovered ? 1.25 : 1;
            const bg = isHovered ? '#e8334a' : '#1a2235';
            const border = isHovered ? '#fff' : '#38b2ac';

            const icon = L.divIcon({
                html: `<div style="
          background:${bg};color:white;
          padding: 4px; border-radius: 50%; width: 32px; height: 32px;
          display:flex;align-items:center;justify-content:center;
          border:2px solid ${border};font-size:16px;
          box-shadow:0 3px 8px rgba(0,0,0,0.35);
          transform: scale(${scale});
          transition: transform 0.2s, background 0.2s;
        ">${place.emoji}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16],
                className: ''
            });

            const marker = L.marker(pos, { icon, zIndexOffset: zIndex })
                .addTo(map)
                .bindPopup(`
          <div style="font-family:'Noto Sans Thai',sans-serif;min-width:180px;">
            <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${place.emoji} ${place.name}</div>
            <div style="font-size:11px;color:#888;">${place.city} · ${place.type}</div>
            <a href="https://www.google.com/maps/search/${encodeURIComponent(place.name + ' Japan')}" target="_blank"
              style="font-size:11px;display:inline-block;margin-top:8px;background:#38b2ac;color:white;padding:5px 10px;border-radius:4px;text-decoration:none;">
              📍 ดูบน Google Maps
            </a>
          </div>
        `);
            marker.on('mouseover', function (e) { this.openPopup(); });
            markersRef.current.push(marker);
        });

        if (coordsForBounds.length > 0) {
            const bounds = L.latLngBounds(coordsForBounds);
            if (coordsForBounds.length === 1) {
                map.setView(coordsForBounds[0], 14);
            } else {
                if (!hoveredPlace) {  // only auto fit bounds if not hovering
                    map.fitBounds(bounds, { padding: [50, 50] });
                }
            }
        }
    }, [places, hoveredPlace]);

    return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}

export default function PlacesPage() {
    const [search, setSearch] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [leafletLoaded, setLeafletLoaded] = useState(!!window.L);
    const [hoveredPlace, setHoveredPlace] = useState(null);
    const [showSidebar, setShowSidebar] = useState(true);

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

    // Unique cities and types for filter dropdowns
    const cities = useMemo(() => [...new Set(placesDatabase.map(p => p.city))], []);
    const types = useMemo(() => [...new Set(placesDatabase.map(p => p.type))], []);

    // Filtered places
    const filtered = useMemo(() => {
        return placesDatabase.filter(p => {
            const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.city.includes(search) || p.type.includes(search);
            const matchCity = !cityFilter || p.city === cityFilter;
            const matchType = !typeFilter || p.type === typeFilter;
            // Only include places with coords for map view
            const hasCoords = !!locationCoords[p.name];
            return matchSearch && matchCity && matchType && hasCoords;
        });
    }, [search, cityFilter, typeFilter]);

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>📌 สถานที่ทั้งหมด</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        ฐานข้อมูลสถานที่ท่องเที่ยว ร้านอาหาร และแหล่งช็อปปิ้งในคันไซ
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setShowSidebar(v => !v)}
                    >
                        {showSidebar ? '◀ ซ่อน' : '▶ แสดง'} รายการ
                    </button>
                </div>
            </div>

            <div className="map-layout" style={{ margin: '0 16px 16px', height: 'calc(100vh - 120px)' }}>
                <div className={`list-sidebar-container ${!showSidebar ? 'collapsed' : ''}`} style={{ width: '340px', flexShrink: 0, height: '100%' }}>
                    <div className="map-sidebar" style={{ width: '100%', height: '100%', borderRight: '1px solid var(--border)', border: '1px solid var(--border)', borderRadius: '12px 0 0 12px' }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                            <input
                                className="places-search"
                                type="text"
                                placeholder="🔍 ค้นหาสถานที่..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ width: '100%', marginBottom: 12 }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <select
                                    className="places-filter"
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">ทุกเมือง</option>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select
                                    className="places-filter"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    style={{ flex: 1 }}
                                >
                                    <option value="">ทุกประเภท</option>
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12, fontWeight: 600 }}>
                                แสดง {filtered.length} สถานที่ (บนแผนที่)
                            </div>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                            {filtered.length === 0 ? (
                                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                                    ไม่พบสถานที่ที่ค้นหา
                                </div>
                            ) : (
                                filtered.map((place, idx) => (
                                    <div
                                        key={idx}
                                        className="map-stop-item"
                                        style={{ padding: '12px 14px', marginBottom: 8 }}
                                        onMouseEnter={() => setHoveredPlace(place.name)}
                                        onMouseLeave={() => setHoveredPlace(null)}
                                    >
                                        <div style={{ fontSize: 24, marginRight: 12 }}>{place.emoji}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{place.name}</div>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                <span className="place-card-city" style={{ fontSize: 10 }}>{place.city}</span>
                                                <span className="place-card-type" style={{ fontSize: 10 }}>{place.type}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {filtered.length === 0 && (
                            <div className="empty-state" style={{ margin: 20 }}>
                                <div className="empty-state-emoji">🔍</div>
                                <div className="empty-state-text">ไม่พบสถานที่ที่ค้นหา</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="map-container" style={{ flex: 1, borderRadius: showSidebar ? '0 12px 12px 0' : 12, border: '1px solid var(--border)', borderLeft: showSidebar ? 'none' : '1px solid var(--border)', overflow: 'hidden', position: 'relative', zIndex: 1, transition: 'border-radius 0.3s' }}>
                    {!leafletLoaded ? (
                        <div className="empty-state">
                            <div className="empty-state-emoji">🗺️</div>
                            <div className="empty-state-text">กำลังโหลดแผนที่...</div>
                        </div>
                    ) : (
                        <PlacesLeafletMap
                            places={filtered}
                            hoveredPlace={hoveredPlace}
                        />
                    )}
                </div>
            </div >
        </>
    );
}
