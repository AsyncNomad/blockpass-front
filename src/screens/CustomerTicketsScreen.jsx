import { useEffect, useState } from "react";
import MainNav from "./MainNav.jsx";

const tickets = [
  {
    title: "블록핏 헬스장 3개월권",
    period: "2025.12.25~2026.02.24",
    startDate: "2025.12.25",
    endDate: "2026.02.24",
  },
  {
    title: "스테디 독서실 1개월권",
    period: "2025.10.01~2025.10.31",
    startDate: "2025.10.01",
    endDate: "2025.10.31",
  },
  {
    title: "코어바디 피트니스 6시간권",
    period: "2025.10.20 10:00~2025.10.20 16:00",
    startAt: "2025-10-20T10:00:00",
    endAt: "2025-10-20T16:00:00",
  },
  {
    title: "스테디 독서실 90분권",
    period: "2025.10.21 18:00~2025.10.21 19:30",
    startAt: "2025-10-21T18:00:00",
    endAt: "2025-10-21T19:30:00",
  },
];

const parseDate = (value) => {
  const [year, month, day] = value.split(".").map((part) => Number(part));
  return new Date(year, month - 1, day).getTime();
};

const parseDateRange = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (!start || !end) {
    return { start: 0, end: 0 };
  }
  const endOfDay = new Date(end);
  endOfDay.setHours(23, 59, 59, 999);
  return { start, end: endOfDay.getTime() };
};

const getTicketTimes = (ticket) => {
  if (ticket.startAt && ticket.endAt) {
    return { start: Date.parse(ticket.startAt), end: Date.parse(ticket.endAt) };
  }
  if (ticket.startDate && ticket.endDate) {
    return parseDateRange(ticket.startDate, ticket.endDate);
  }
  return { start: 0, end: 0 };
};

const getProgress = (ticket) => {
  const { start, end } = getTicketTimes(ticket);
  const now = Date.now();
  if (!start || !end || end <= start) {
    return 0;
  }
  const percent = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
};

const getRemainingLabel = (ticket) => {
  const { start, end } = getTicketTimes(ticket);
  const now = Date.now();
  if (!start || !end || now >= end) {
    return "만료됨";
  }
  const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
  const days = Math.floor(remainingSeconds / 86400);
  const hours = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  if (days > 0) {
    return `${days}일 남음`;
  }
  if (hours > 0) {
    return `${hours}시간 남음`;
  }
  return `${Math.max(1, minutes)}분 남음`;
};

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
              <div className="ticket-header">
                <div className="ticket-title">{ticket.title}</div>
                <div className="ticket-remaining">{getRemainingLabel(ticket)}</div>
              </div>
              <div className="ticket-period">{ticket.period}</div>
              <div className="ticket-progress">
                <div className="ticket-bar">
                  <span
                    className="ticket-bar-fill"
                    style={{
                      width: `${getProgress(ticket)}%`,
                    }}
                  />
                </div>
                <span className="ticket-percent">
                  {getProgress(ticket)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
      {activeTicket && (
        <div className="qr-overlay" role="dialog" aria-modal="true">
          <div className={`qr-sheet ${isExpanded ? "expanded" : ""}`}>
            <div className="qr-header">
              <div className="qr-ticket-title">{activeTicket.title}</div>
              <button className="qr-close" type="button" onClick={closeQr}>
                닫기
              </button>
            </div>
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
