import { useState, useEffect } from "react";
import BackButton from "./BackButton.jsx";
import api from "../utils/api";

export default function AuthScreen({ onSubmit, onBack }) {
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    passwordConfirm: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 유효성 검사 상태
  const [emailError, setEmailError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");

  const isSignup = mode === "signup";

  // 이메일 형식 검사 함수
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 이메일 중복 체크 (디바운스)
  useEffect(() => {
    if (!isSignup || !formData.email) {
      setEmailExists(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      setEmailExists(false);
      return;
    }

    const timer = setTimeout(async () => {
      setEmailChecking(true);
      try {
        // 이메일 중복 체크 API 호출 (회원가입 시도로 체크)
        await api.post('/auth/check-email', { email: formData.email });
        setEmailExists(false);
      } catch (err) {
        if (err.response?.status === 400 || err.response?.data?.detail?.includes("이미")) {
          setEmailExists(true);
        } else {
          setEmailExists(false);
        }
      } finally {
        setEmailChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, isSignup]);

  // 비밀번호 일치 검사
  useEffect(() => {
    if (!isSignup) {
      setPasswordMatchError("");
      return;
    }

    if (formData.passwordConfirm && formData.password !== formData.passwordConfirm) {
      setPasswordMatchError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordMatchError("");
    }
  }, [formData.password, formData.passwordConfirm, isSignup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError("");

    // 이메일 형식 실시간 검사
    if (name === "email" && isSignup) {
      if (value && !isValidEmail(value)) {
        setEmailError("이메일 양식에 맞춰 주세요.");
      } else {
        setEmailError("");
      }
    }
  };

  // 모드 전환 시 폼 초기화
  const switchMode = (newMode) => {
    setMode(newMode);
    setFormData({
      email: "",
      password: "",
      name: "",
      passwordConfirm: ""
    });
    setError("");
    setEmailError("");
    setEmailExists(false);
    setPasswordMatchError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        // 회원가입 유효성 검사
        if (!formData.name || !formData.email || !formData.password) {
          setError("모든 항목을 입력해주세요.");
          setLoading(false);
          return;
        }

        if (!isValidEmail(formData.email)) {
          setEmailError("이메일 양식에 맞춰 주세요.");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          setError("비밀번호는 8자리 이상이어야 합니다.");
          setLoading(false);
          return;
        }

        if (formData.password !== formData.passwordConfirm) {
          setPasswordMatchError("비밀번호가 일치하지 않습니다.");
          setLoading(false);
          return;
        }

        if (emailExists) {
          setError("이미 존재하는 아이디입니다.");
          setLoading(false);
          return;
        }

        // 회원가입 시 role 선택 화면으로 이동
        onSubmit("signup", {
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        
      } else {
        // 로그인
        if (!formData.email || !formData.password) {
          setError("이메일과 비밀번호를 입력해주세요.");
          setLoading(false);
          return;
        }

        // OAuth2 형식으로 로그인
        const formBody = new URLSearchParams();
        formBody.append('username', formData.email);
        formBody.append('password', formData.password);

        const response = await api.post('/auth/login', formBody, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        // 토큰 저장
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user_role', response.data.role);
        localStorage.setItem('user_name', response.data.user_info?.name || '');

        // role에 따라 화면 전환
        onSubmit("login", response.data.role);
      }
    } catch (err) {
      console.error("Auth error:", err);
      if (err.response?.status === 401) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(detail[0]?.msg || "오류가 발생했습니다.");
        } else {
          setError("오류가 발생했습니다. 다시 시도해주세요.");
        }
      } else {
        setError("오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card" key="auth">
      {onBack && <BackButton onBack={onBack} />}
      <p className="card-title">시작해볼게요.</p>
      <div className="auth-panel" key={mode}>
        <form className="form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              이름
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
              />
            </label>
          )}
          
          <label>
            아이디
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              style={{
                borderColor: emailError ? '#c0392b' : (emailExists ? '#c0392b' : undefined)
              }}
            />
            {/* 이메일 형식 에러 */}
            {emailError && (
              <div style={{ 
                color: '#c0392b', 
                fontSize: '12px', 
                marginTop: '4px'
              }}>
                {emailError}
              </div>
            )}
            {/* 이메일 중복 체크 결과 - 밑으로 이동 */}
            {isSignup && formData.email && isValidEmail(formData.email) && !emailError && (
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                marginTop: '4px',
                color: emailChecking ? '#999' : (emailExists ? '#c0392b' : '#27ae60')
              }}>
                {emailChecking ? '확인 중...' : (emailExists ? '사용 불가' : '사용 가능')}
              </div>
            )}
          </label>
          
          <label>
            비밀번호
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8자리 이상"
            />
          </label>
          
          {isSignup && (
            <label>
              비밀번호 확인
              <input 
                type="password" 
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="비밀번호 재입력"
                style={{
                  borderColor: passwordMatchError ? '#c0392b' : undefined
                }}
              />
              {/* 비밀번호 불일치 에러 */}
              {passwordMatchError && (
                <div style={{ 
                  color: '#c0392b', 
                  fontSize: '12px', 
                  marginTop: '4px'
                }}>
                  {passwordMatchError}
                </div>
              )}
            </label>
          )}
          
          {error && (
            <div style={{ 
              color: '#c0392b', 
              fontSize: '13px', 
              textAlign: 'center',
              marginTop: '-8px'
            }}>
              {error}
            </div>
          )}
        </form>
        
        <div className="button-group">
          <button
            className="primary"
            type="submit"
            onClick={handleSubmit}
            disabled={loading || (isSignup && (emailError || passwordMatchError || emailExists))}
          >
            {loading ? "처리 중..." : (isSignup ? "회원가입" : "로그인")}
          </button>
          
          {!isSignup && (
            <button
              className="ghost"
              type="button"
              onClick={() => switchMode("signup")}
            >
              회원가입
            </button>
          )}
          
          {isSignup && (
            <button
              className="ghost"
              type="button"
              onClick={() => switchMode("login")}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </div>
  );
}