import { useEffect, useState } from "react";
import MainNav from "./MainNav.jsx";

const tickets = [
  { title: "블록핏 헬스장 3개월권", period: "2025.12.25~2026.02.24" },
  { title: "스테디 독서실 1개월권", period: "2025.10.01~2025.10.31" },
];

export default function CustomerTicketsScreen({ onTickets, onMain, onMy }) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!activeTicket || !expiresAt) {
      return undefined;
    }

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [activeTicket, expiresAt]);

  const openQr = (ticket) => {
    setActiveTicket(ticket);
    setExpiresAt(Date.now() + 30000);
    setTimeLeft(30);
  };

  const closeQr = () => {
    setActiveTicket(null);
    setExpiresAt(0);
    setTimeLeft(0);
  };

  const refreshQr = () => {
    setExpiresAt(Date.now() + 30000);
    setTimeLeft(30);
  };

  return (
    <div className="main-screen">
      <section className="main-section">
        <h2 className="main-title">나의 이용권</h2>
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <button
              className="ticket-card ticket-button"
              key={ticket.title}
              type="button"
              onClick={() => openQr(ticket)}
            >
              <div className="ticket-title">{ticket.title}</div>
              <div className="ticket-period">{ticket.period}</div>
            </button>
          ))}
        </div>
      </section>
      {activeTicket && (
        <div className="qr-overlay" role="dialog" aria-modal="true">
          <div className="qr-sheet">
            <button className="qr-close" type="button" onClick={closeQr}>
              닫기
            </button>
            <div className="qr-ticket-title">{activeTicket.title}</div>
            <div className="qr-box">
              <div className="qr-grid" aria-hidden="true" />
              {timeLeft === 0 && (
                <div className="qr-expired">
                  <p>유효 시간이 만료되었어요.</p>
                  <button className="refresh-button" type="button" onClick={refreshQr}>
                    새로고침
                  </button>
                </div>
              )}
            </div>
            <div className="qr-timer">
              {timeLeft > 0 ? `유효시간 ${timeLeft}s` : "만료됨"}
            </div>
          </div>
        </div>
      )}
      <MainNav active="tickets" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
