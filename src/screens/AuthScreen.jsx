import { useState } from "react";

export default function AuthScreen({ onSubmit }) {
  const [mode, setMode] = useState("login");
  const isSignup = mode === "signup";

  return (
    <div className="card" key="auth">
      <p className="card-title">시작해볼게요.</p>
      <div className="auth-panel" key={mode}>
        <form className="form">
          {isSignup && (
            <label>
              이름
              <input type="text" placeholder="홍길동" />
            </label>
          )}
          <label>
            아이디
            <input type="text" placeholder="blockpass_id" />
          </label>
          <label>
            비밀번호
            <input type="password" placeholder="8자리 이상" />
          </label>
          {isSignup && (
            <label>
              비밀번호 확인
              <input type="password" placeholder="비밀번호 확인" />
            </label>
          )}
        </form>
        <div className="button-group">
          <button
            className="primary"
            type="button"
            onClick={() => {
              if (isSignup) {
                setMode("login");
                return;
              }
              onSubmit();
            }}
          >
            {isSignup ? "회원가입" : "로그인"}
          </button>
          {!isSignup && (
            <button
              className="ghost"
              type="button"
              onClick={() => setMode("signup")}
            >
              회원가입
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
