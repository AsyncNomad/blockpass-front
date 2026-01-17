export default function MainNav({ active, onTickets, onMain, onMy }) {
  return (
    <nav className="main-nav">
      <button
        className={`nav-item ${active === "tickets" ? "active" : ""}`}
        type="button"
        onClick={onTickets}
      >
        <span className="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M5 7h14v10H5z" />
            <path d="M8 7v10M16 7v10" />
          </svg>
        </span>
        <span className="nav-label">나의 이용권</span>
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
