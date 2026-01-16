import MainNav from "./MainNav.jsx";

export default function CustomerMyScreen({ onTickets, onMain, onMy, onLogout }) {
  return (
    <div className="main-screen">
      <section className="main-section">
        <h2 className="main-title">홍길동님</h2>
        <div className="my-card">
          <div className="my-label">메타마스크 지갑 주소</div>
          <div className="my-value">0x12ab...78cd</div>
        </div>
        <button className="logout-button" type="button" onClick={onLogout}>
          로그아웃
        </button>
      </section>
      <MainNav active="my" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
