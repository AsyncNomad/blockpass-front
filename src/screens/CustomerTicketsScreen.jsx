import MainNav from "./MainNav.jsx";

const tickets = [
  { title: "블록핏 헬스장 3개월권", period: "2025.12.25~2026.02.24" },
  { title: "스테디 독서실 1개월권", period: "2025.10.01~2025.10.31" },
];

export default function CustomerTicketsScreen({ onTickets, onMain, onMy }) {
  return (
    <div className="main-screen">
      <section className="main-section">
        <h2 className="main-title">나의 이용권</h2>
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <div className="ticket-card" key={ticket.title}>
              <div className="ticket-title">{ticket.title}</div>
              <div className="ticket-period">{ticket.period}</div>
            </div>
          ))}
        </div>
      </section>
      <MainNav active="tickets" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
