import React, { useState } from 'react';
import { auth, googleProvider } from '../firebaseSetup';
import { signInWithPopup } from 'firebase/auth';

export function MultiplayerOverlay({
    userName, setAndSaveName, showNamePrompt,
    roomId, isHost, mode, connectionStatus,
    onlineUsers, history, getShareLink
}) {
    const [nameInput, setNameInput] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);

    // Real Firebase Google Login
    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result && result.user && result.user.email) {
                setAndSaveName(result.user.email);
            }
        } catch (error) {
            console.error("Google Login Error:", error);
            alert("ไม่สามารถล็อกอินได้ โปรดตรวจสอบการตั้งค่า Firebase API Keys ของคุณ");
        }
    };

    if (showNamePrompt) {
        return (
            <div className="modal-overlay" style={{ zIndex: 9999, background: 'rgba(10, 14, 26, 0.95)' }}>
                <div className="modal" style={{ maxWidth: 400, padding: 30, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>ยินดีต้อนรับสู่ทริป</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
                        โปรดระบุตัวตนของคุณเพื่อเข้าถึงแผนการเดินทาง
                    </p>

                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: 14, justifyContent: 'center', marginBottom: 16, background: 'white', color: '#444' }}
                        onClick={handleGoogleLogin}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style={{ width: 18 }} alt="g" />
                        ล็อกอินด้วย Google (Admin)
                    </button>

                    <div style={{ color: 'var(--text-muted)', fontSize: 11, margin: '16px 0' }}>— หรือใช้ชื่อทั่วไป (สาธารณะ) —</div>

                    <input
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        placeholder="ชื่อของคุณ..."
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white', marginBottom: 16, fontSize: 16 }}
                        autoFocus
                    />
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: 14, justifyContent: 'center' }}
                        onClick={() => {
                            if (nameInput.trim()) setAndSaveName(nameInput.trim());
                        }}
                    >
                        เข้าสู่แผนในฐานะผู้เยี่ยมชม
                    </button>
                </div>
            </div>
        );
    }

    const isAdmin = userName === 'pitiwxt@gmail.com';

    return (
        <>
            {/* Top Banner indicating multiplayer status */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 40,
                background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
                zIndex: 100, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: connectionStatus === 'connected' ? '#10b981' : (connectionStatus === 'connecting' ? '#f59e0b' : '#e8334a')
                    }} />
                    <span style={{ color: 'var(--text-muted)' }}>
                        {connectionStatus === 'connected' ? 'ออนไลน์' : (connectionStatus === 'connecting' ? 'กำลังเชื่อมต่อ...' : 'ออฟไลน์')}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: -8, marginLeft: 'auto' }}>
                    {onlineUsers.map(u => {
                        const isNodeAdmin = u.name === 'pitiwxt@gmail.com';
                        return (
                            <div key={u.id} title={`${u.name} ${isNodeAdmin ? '(Admin)' : `(${u.mode})`}`} style={{
                                width: 26, height: 26, borderRadius: '50%', background: isNodeAdmin ? 'var(--accent-gold)' : 'var(--accent-red)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: 10, fontWeight: 700, border: '2px solid var(--bg-secondary)',
                                marginLeft: -8, position: 'relative'
                            }}>
                                {u.name.substring(0, 2).toUpperCase()}
                                {isNodeAdmin && <span style={{ position: 'absolute', top: -6, right: -4, fontSize: 10 }}>👑</span>}
                            </div>
                        )
                    })}
                </div>

                <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '4px 10px' }}
                    onClick={() => setShowShareModal(true)}
                >
                    🔗 ประวัติ & แชร์
                </button>
            </div>

            {showShareModal && (
                <div className="modal-overlay" onClick={() => setShowShareModal(false)} style={{ zIndex: 10000 }}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
                        <div className="modal-header">
                            <h3>🔗 แชร์และประวัติ</h3>
                            <button className="modal-close" onClick={() => setShowShareModal(false)}>✕</button>
                        </div>
                        <div className="modal-body" style={{ padding: 20 }}>

                            {isAdmin && isHost ? (
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ padding: 12, background: 'rgba(212, 168, 67, 0.15)', borderRadius: 8, marginBottom: 16, border: '1px solid rgba(212, 168, 67, 0.3)' }}>
                                        <div style={{ fontSize: 13, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 16 }}>👑</span> <strong>ผู้ดูแลระบบ (Admin: pitiwxt)</strong>
                                        </div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                            คุณคือแอดมินระบบหลัก อำนาจครอบคลุมทุกการแชร์
                                        </div>
                                    </div>

                                    <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>แชร์ลิงก์ให้เพื่อน</h4>

                                    <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-teal)', marginBottom: 4 }}>✅ แชร์แบบแก้ไขได้ (Editor)</div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input type="text" readOnly value={getShareLink('edit')} style={{ flex: 1, padding: 8, borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', fontSize: 11 }} />
                                            <button className="btn btn-primary btn-sm" onClick={() => navigator.clipboard.writeText(getShareLink('edit'))}>Copy</button>
                                        </div>
                                    </div>

                                    <div style={{ background: 'var(--bg-primary)', padding: 12, borderRadius: 8 }}>
                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>👀 แชร์แบบดูอย่างเดียว (Viewer)</div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input type="text" readOnly value={getShareLink('view')} style={{ flex: 1, padding: 8, borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'white', fontSize: 11 }} />
                                            <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText(getShareLink('view'))}>Copy</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginBottom: 24, padding: 12, background: 'rgba(56, 178, 172, 0.1)', borderRadius: 8 }}>
                                    <div style={{ fontSize: 13, color: 'var(--accent-teal)' }}>
                                        คุณเชื่อมต่อเข้าสู่ทริปนี้ในฐานะ <strong>{mode === 'edit' ? 'ผู้แก้ไข (Editor)' : 'ผู้เข้าชม (Viewer)'}</strong>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>ประวัติการแก้ไข (History)</h4>
                                <div style={{ maxHeight: 200, overflowY: 'auto', background: 'var(--bg-primary)', borderRadius: 8, padding: 12 }}>
                                    {history.length === 0 ? (
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>ยังไม่มีการแก้ไข</div>
                                    ) : history.map((h, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 12, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                                            <div style={{ color: 'var(--accent-gold)', width: 40, flexShrink: 0 }}>{new Date(h.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
                                            <div style={{ fontWeight: 600, width: 60, flexShrink: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{h.user}</div>
                                            <div style={{ color: 'var(--text-primary)', flex: 1 }}>{h.action}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
