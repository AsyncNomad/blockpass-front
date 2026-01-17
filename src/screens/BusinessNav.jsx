export default function BusinessNav({ active, onMembers, onMain, onMy }) {
  return (
    <nav className="main-nav">
      <button
        className={`nav-item ${active === "members" ? "active" : ""}`}
        type="button"
        onClick={onMembers}
      >
        <span className="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M3 20a6 6 0 0 1 12 0" />
            <path d="M14 20a4 4 0 0 1 8 0" />
          </svg>
        </span>
        <span className="nav-label">회원 목록</span>
      </button>
      <button
        className={`nav-item ${active === "main" ? "active" : ""}`}
        type="button"
        onClick={onMain}
      >
        <span className="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M4 11l8-7 8 7v8H4z" />
          </svg>
        </span>
        <span className="nav-label">메인</span>
      </button>
      <button
        className={`nav-item ${active === "my" ? "active" : ""}`}
        type="button"
        onClick={onMy}
      >
        <span className="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <circle cx="12" cy="8" r="3" />
            <path d="M6 19a6 6 0 0 1 12 0" />
          </svg>
        </span>
        <span className="nav-label">마이페이지</span>
      </button>
    </nav>
  );
}
