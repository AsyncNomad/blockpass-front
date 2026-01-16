import BusinessNav from "./BusinessNav.jsx";

export default function BusinessMainScreen({
  passes,
  onMembers,
  onMain,
  onMy,
  onAddPolicy,
}) {
  return (
    <div className="main-screen business-main">
      <div className="main-search">
        <input type="text" placeholder="이용권을 검색해보세요" />
      </div>

      <section className="main-section">
        <h2 className="main-title">판매중인 이용권</h2>
        <div className="main-cards">
          {passes.map((pass) => (
            <div className="main-card" key={pass.title}>
              <div className="main-card-title">{pass.title}</div>
              <div className="main-card-sub">{pass.price}</div>
            </div>
          ))}
        </div>
      </section>

      <button className="policy-cta" type="button" onClick={onAddPolicy}>
        새로운 이용권 정책 추가
      </button>

      <BusinessNav active="main" onMembers={onMembers} onMain={onMain} onMy={onMy} />
    </div>
  );
}
