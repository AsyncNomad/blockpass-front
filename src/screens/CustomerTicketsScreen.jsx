import { useEffect, useState } from "react";
import MainNav from "./MainNav.jsx";

const tickets = [
  { title: "블록핏 헬스장 3개월권", period: "2025.12.25~2026.02.24" },
  { title: "스테디 독서실 1개월권", period: "2025.10.01~2025.10.31" },
];

export default function CustomerTicketsScreen({
  onTickets,
  onMain,
  onMy,
  onTerms,
  onRefund,
  resumeTicket,
  resumeExpiresAt,
  resumeExpanded,
  onResumeConsumed,
}) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [expiresAt, setExpiresAt] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const openQr = (ticket, options = {}) => {
    setActiveTicket(ticket);
    const nextExpiresAt = options.expiresAt || Date.now() + 30000;
    setExpiresAt(nextExpiresAt);
    const remaining = Math.max(0, Math.ceil((nextExpiresAt - Date.now()) / 1000));
    setTimeLeft(remaining);
    setIsExpanded(Boolean(options.expanded));
  };

  const closeQr = () => {
    setActiveTicket(null);
    setExpiresAt(0);
    setTimeLeft(0);
    setIsExpanded(false);
  };

  const refreshQr = () => {
    setExpiresAt(Date.now() + 30000);
    setTimeLeft(30);
  };

  useEffect(() => {
    if (!resumeTicket) {
      return;
    }
    openQr(resumeTicket, {
      expiresAt: resumeExpiresAt,
      expanded: resumeExpanded,
    });
    if (onResumeConsumed) {
      onResumeConsumed();
    }
  }, [resumeTicket, resumeExpiresAt, resumeExpanded]);

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
          <div className={`qr-sheet ${isExpanded ? "expanded" : ""}`}>
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
            <button
              className="qr-expand"
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
            >
              <span className="chevron" />
            </button>
            {isExpanded && (
              <div className="qr-actions">
                <button
                  className="qr-action"
                  type="button"
                  onClick={() => {
                    if (onTerms) {
                      onTerms(activeTicket, expiresAt, true);
                    }
                  }}
                >
                  세부 약관 확인하기
                </button>
                <button
                  className="qr-action"
                  type="button"
                  onClick={() => {
                    if (onRefund) {
                      onRefund(activeTicket, expiresAt, true);
                    }
                  }}
                >
                  환불하기
                </button>
                <button className="qr-action danger" type="button">
                  시설 파산신고
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <MainNav active="tickets" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
