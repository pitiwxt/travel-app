import React from 'react';
import { auth, googleProvider } from '../firebaseSetup';
import { signInWithPopup } from 'firebase/auth';

export default function LoginScreen() {
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error(error);
            alert("ไม่สามารถเข้าสู่ระบบได้ กรุณาตรวจสอบการตั้งค่า Firebase API Key ในไฟล์ src/firebaseSetup.js");
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <div style={{ background: 'var(--bg-secondary)', padding: 40, borderRadius: 16, textAlign: 'center', maxWidth: 400, width: '90%', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <img src="/logo.png" alt="Logo" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
                <h1 style={{ color: 'var(--text-primary)', marginBottom: 12, fontSize: 24 }}>เกียวโต・โอซาก้า</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 30, fontSize: 13, lineHeight: 1.6 }}>
                    ระบบการจัดทริปส่วนตัว สงวนสิทธิ์สำหรับสมาชิกและผู้ได้รับเชิญเท่านั้น กรุณาเข้าสู่ระบบด้วยบัญชี Google ของท่าน
                </p>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px 20px', justifyContent: 'center', background: '#ffffff', color: '#1f2937', fontWeight: 600, border: '1px solid #d1d5db' }}
                    onClick={handleLogin}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style={{ width: 20, marginRight: 8 }} alt="G" />
                    ล็อกอินด้วยบัญชี Google
                </button>
            </div>
        </div>
    );
}
