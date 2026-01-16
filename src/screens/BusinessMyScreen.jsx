import BusinessNav from "./BusinessNav.jsx";

export default function BusinessMyScreen({ onMembers, onMain, onMy, onLogout }) {
  return (
    <div className="main-screen">
      <section className="main-section">
        <h2 className="main-title">홍길동 사장님</h2>
        <button className="logout-button" type="button" onClick={onLogout}>
          로그아웃
        </button>
      </section>
      <BusinessNav active="my" onMembers={onMembers} onMain={onMain} onMy={onMy} />
    </div>
  );
}
