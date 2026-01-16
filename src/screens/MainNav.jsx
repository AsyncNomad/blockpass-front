export default function MainNav({ active, onTickets, onMain, onMy }) {
  return (
    <nav className="main-nav">
      <button
        className={`nav-item ${active === "tickets" ? "active" : ""}`}
        type="button"
        onClick={onTickets}
      >
        나의 이용권
      </button>
      <button
        className={`nav-item ${active === "main" ? "active" : ""}`}
        type="button"
        onClick={onMain}
      >
        메인
      </button>
      <button
        className={`nav-item ${active === "my" ? "active" : ""}`}
        type="button"
        onClick={onMy}
      >
        마이페이지
      </button>
    </nav>
  );
}
