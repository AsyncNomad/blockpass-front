export default function SignupComplete({ onLogin }) {
  return (
    <div className="card" key="signup-complete">
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
        }}>
          <svg 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h1 className="card-title" style={{ marginBottom: '12px' }}>
          회원 가입이 완료되었습니다
        </h1>
        
        <p style={{ 
          color: '#64748b', 
          fontSize: '15px',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          BlockPass의 회원이 되신 것을 환영합니다
        </p>
        
        <div className="button-group">
          <button
            className="primary"
            onClick={onLogin}
          >
            로그인하기
          </button>
        </div>
      </div>
    </div>
  );
}
