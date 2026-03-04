import React, { useEffect, useState } from 'react';

export default function SplashScreen({ text = "กำลังเตรียมข้อมูล...", subText = "กรุณารอสักครู่" }) {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'var(--bg-primary, #0a0e1a)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 99999, color: 'var(--text-primary, #fff)'
        }}>
            <div className="splash-logo-container">
                <img src="/logo.png" alt="Logo" className="splash-logo pulse-animation" />
            </div>

            <h2 style={{
                marginTop: 24, fontSize: 20, fontWeight: 600,
                fontFamily: "'Noto Sans Thai', sans-serif", letterSpacing: 0.5
            }}>
                {text}{dots}
            </h2>

            {subText && (
                <p style={{
                    marginTop: 8, fontSize: 13, color: 'var(--text-muted, #6b7a99)',
                    fontFamily: "'Noto Sans Thai', sans-serif"
                }}>
                    {subText}
                </p>
            )}

            <div className="splash-spinner" style={{ marginTop: 32 }}></div>
        </div>
    );
}
