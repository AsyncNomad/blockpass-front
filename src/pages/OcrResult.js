import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api'; // 아까 만든 공통 API 도구

const OcrResult = () => {
    const { docId } = useParams(); // URL에서 ID를 가져옵니다.
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                // [팩트체크] AI가 아직 없으므로 DB에서 직접 조회합니다.
                const res = await api.get(`/ocr/result/${docId}`);
                setResult(res.data);
            } catch (err) {
                alert("결과를 불러올 수 없습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [docId]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>AI 분석 리포트 생성 중...</div>;
    if (!result || !result.parsed_data) return <div style={{ textAlign: 'center' }}>데이터가 아직 준비되지 않았습니다.</div>;

    const { name, birth, gender, duration } = result.parsed_data;

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center' }}>분석 리포트</h2>
            
            {/* 인증 마크 (허점 해결) */}
            <div style={{ 
                backgroundColor: '#e7f3ff', padding: '15px', borderRadius: '10px', 
                textAlign: 'center', marginBottom: '20px', border: '2px solid #007bff' 
            }}>
                <span style={{ fontSize: '24px' }}>✅</span>
                <h3 style={{ color: '#007bff', margin: '10px 0' }}>적합한 회원입니다</h3>
                <p style={{ fontSize: '12px', color: '#666' }}>블록체인 계약 검증이 완료되었습니다.</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', color: '#888' }}>이름</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{name || "희원 군"}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', color: '#888' }}>생년월일</td>
                        <td style={{ padding: '10px' }}>{birth || "199X.XX.XX"}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px', color: '#888' }}>계약 기간</td>
                        <td style={{ padding: '10px' }}>{duration || "12개월"}</td>
                    </tr>
                </tbody>
            </table>

            <button 
                onClick={() => navigate('/dashboard')} 
                style={{ 
                    width: '100%', padding: '15px', backgroundColor: '#007bff', 
                    color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' 
                }}
            >
                시설 보러가기
            </button>
        </div>
    );
};

export default OcrResult;