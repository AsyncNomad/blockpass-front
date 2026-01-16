import { useEffect, useMemo, useState } from "react";

const screens = {
  LANDING: "landing",
  AUTH: "auth",
  ROLE: "role",
};

export default function App() {
  const [screen, setScreen] = useState(screens.LANDING);
  const [showHello, setShowHello] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);

  const screenTitle = useMemo(() => {
    if (screen === screens.ROLE) {
      return "역할 선택";
    }
    return "안전한 이용권 결제";
  }, [screen]);

  useEffect(() => {
    if (screen !== screens.LANDING) {
      return undefined;
    }

    setShowHello(false);
    setShowSubtitle(false);
    const subtitleTimer = setTimeout(() => {
      setShowSubtitle(true);
    }, 1900);
    const helloTimer = setTimeout(() => {
      setShowHello(true);
    }, 1300);
    const nextTimer = setTimeout(() => {
      setScreen(screens.AUTH);
    }, 3200);

    return () => {
      clearTimeout(subtitleTimer);
      clearTimeout(helloTimer);
      clearTimeout(nextTimer);
    };
  }, [screen]);

  return (
    <div className={`app ${screen !== screens.LANDING ? "logo-docked" : ""}`}>
      <main className="shell">
        <div className="logo-wrap" aria-hidden="true">
          <svg
            className="logo-draw"
            viewBox="0 0 360 220"
            role="img"
            aria-label="Blockpass 로고"
          >
            <g className="logo-strokes">
              <path
                className="logo-stroke"
                style={{ "--delay": "0s" }}
                d="M30 88 90 48 150 88 90 128z"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.08s" }}
                d="M90 48v80"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.16s" }}
                d="M150 88v80"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.24s" }}
                d="M30 88v80l60 40 60-40"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.32s" }}
                d="M150 88 210 48 270 88 210 128z"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.4s" }}
                d="M210 48v80"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.48s" }}
                d="M270 88v80"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.56s" }}
                d="M150 88v80l60 40 60-40"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.64s" }}
                d="M270 70h40a22 22 0 0 1 22 22v44a22 22 0 0 1-22 22h-40"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.72s" }}
                d="M270 92h18m-18 18h18m-18 18h18"
              />
              <path
                className="logo-stroke"
                style={{ "--delay": "0.8s" }}
                d="M220 122l16 16 26-28"
              />
            </g>
            <text
              className="logo-stroke logo-text"
              style={{ "--delay": "0.95s" }}
              x="180"
              y="205"
              textAnchor="middle"
            >
              BLOCKPASS
            </text>
          </svg>
        </div>
        <section className="stage">
          {screen === screens.LANDING && (
            <div className="card stack" key="landing">
              <div className="logo-spacer" aria-hidden="true" />
            </div>
          )}

          {screen === screens.AUTH && (
            <div className="card" key="auth">
              <p className="card-title">시작해볼게요.</p>
              <form className="form">
                <label>
                  아이디
                  <input type="text" placeholder="blockpass_id" />
                </label>
                <label>
                  비밀번호
                  <input type="password" placeholder="8자리 이상" />
                </label>
              </form>
              <div className="button-group">
                <button
                  className="primary"
                  type="button"
                  onClick={() => setScreen(screens.ROLE)}
                >
                  로그인
                </button>
                <button className="ghost" type="button">
                  회원가입
                </button>
              </div>
            </div>
          )}

          {screen === screens.ROLE && (
            <div className="card role-card" key="role">
              <p className="card-copy">역할을 선택해주세요.</p>
              <div className="role-grid">
                <button className="role" type="button">
                  <span className="role-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img">
                      <rect x="4" y="8" width="16" height="10" rx="2" />
                      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                      <path d="M4 12h16" />
                    </svg>
                  </span>
                  <span className="role-title">사업자</span>
                  <span className="role-desc">
                    이용권 판매자를 위한 정산, 예치, 계약 관리 기능을 제공해요.
                  </span>
                </button>
                <button className="role" type="button">
                  <span className="role-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" role="img">
                      <circle cx="12" cy="8" r="3" />
                      <path d="M5 19a7 7 0 0 1 14 0" />
                      <path d="M7 19h10" />
                    </svg>
                  </span>
                  <span className="role-title">고객</span>
                  <span className="role-desc">
                    내 이용권을 블록체인에 담아 보호해요.
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
