import MainNav from "./MainNav.jsx";

const recommendations = [
  { name: "블록핏 헬스장", distance: "0.8km" },
  { name: "스테디 독서실", distance: "1.4km" },
  { name: "코어바디 피트니스", distance: "2.1km" },
];

export default function CustomerMainScreen({ onTickets, onMain, onMy, onAddPass }) {
  return (
    <div className="main-screen customer-main">
      <section className="main-section">
        <div className="section-header sticky-title">
          <span className="section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M12 3a7 7 0 0 1 7 7c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 7-7z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <h2 className="main-title">주변 추천</h2>
        </div>
        <div className="main-cards grid-cards">
          {recommendations.map((item) => (
            <div className="main-card" key={item.name}>
              <div className="card-image" aria-hidden="true" />
              <div className="main-card-title">{item.name}</div>
              <div className="main-card-sub">
                <span className="pin" aria-hidden="true" />
                {item.distance}
              </div>
            </div>
          ))}
        </div>
      </section>
      <button className="policy-cta" type="button" onClick={onAddPass}>
        새로운 이용권 추가하기
      </button>
      <MainNav active="main" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
