import MainNav from "./MainNav.jsx";

const recommendations = [
  { name: "블록핏 헬스장", distance: "0.8km" },
  { name: "스테디 독서실", distance: "1.4km" },
  { name: "코어바디 피트니스", distance: "2.1km" },
];

export default function CustomerMainScreen({ onTickets, onMain, onMy, onAddPass }) {
  return (
    <div className="main-screen customer-main">
      <div className="main-search">
        <input type="text" placeholder="주변 시설을 검색해보세요" />
      </div>
      <section className="main-section">
        <h2 className="main-title">주변 추천</h2>
        <div className="main-cards">
          {recommendations.map((item) => (
            <div className="main-card" key={item.name}>
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
