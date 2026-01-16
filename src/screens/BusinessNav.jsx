export default function BusinessNav({ active, onMembers, onMain, onMy }) {
  return (
    <nav className="main-nav">
      <button
        className={`nav-item ${active === "members" ? "active" : ""}`}
        type="button"
        onClick={onMembers}
      >
        회원 목록
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
