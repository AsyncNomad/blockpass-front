import { useEffect, useState } from "react";
import MainNav from "./MainNav.jsx";
import api from "../utils/api";

const pad2 = (value) => String(value).padStart(2, "0");

const formatDate = (value, withTime = false) => {
  if (!value) return "";
  const date = new Date(value);
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  if (!withTime) {
    return `${y}-${m}-${d}`;
  }
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

const getTicketTimes = (ticket) => {
  if (ticket.startAt && ticket.endAt) {
    return { start: Date.parse(ticket.startAt), end: Date.parse(ticket.endAt) };
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
  const remainingMinutes = Math.max(0, Math.ceil((end - now) / (60 * 1000)));
  const isDayBased =
    ticket.durationMinutes != null &&
    ticket.durationMinutes >= 24 * 60 &&
    ticket.durationMinutes % (24 * 60) === 0;

  if (isDayBased) {
    const days = Math.ceil(remainingMinutes / (24 * 60));
    return `${days}일 남음`;
  }
  if (remainingMinutes >= 60) {
    const hours = Math.ceil(remainingMinutes / 60);
    return `${hours}시간 남음`;
  }
  return `${Math.max(1, remainingMinutes)}분 남음`;
};

const getPeriodLabel = (ticket) => {
  const { start, end } = getTicketTimes(ticket);
  if (!start || !end) {
    return "";
  }
  const isDayBased =
    ticket.durationMinutes != null &&
    ticket.durationMinutes >= 24 * 60 &&
    ticket.durationMinutes % (24 * 60) === 0;
  if (isDayBased) {
    return `${formatDate(start)}~${formatDate(end)}`;
  }
  return formatDate(start);
};

export default function CustomerTicketsScreen({
  onTickets,
  onMain,
  onMy,
  onTerms,
  onRefund,
  onBankruptcy,
  resumeTicket,
  resumeExpiresAt,
  resumeExpanded,
  onResumeConsumed,
}) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  const handleDeleteExpired = async () => {
    if (!activeTicket?.id) {
      return;
    }
    try {
      await api.delete(`/orders/${activeTicket.id}`);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== activeTicket.id));
      closeQr();
    } catch (err) {
      console.error("이용권 삭제 실패:", err);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await api.get("/orders/my");
        const items = (response.data || []).map((row) => {
          const startAt = row.start_at;
          const endAt = row.end_at;
          return {
            id: row.id,
            passId: row.pass_id,
            title: row.title,
            price: row.price,
            terms: row.terms,
            contract_address: row.contract_address,
            contract_chain: row.contract_chain,
            refund_rules: row.refund_rules || [],
            startAt,
            endAt,
            durationMinutes: row.duration_minutes,
          };
        });
        setTickets(items);
      } catch (err) {
        console.error("이용권 조회 실패:", err);
        setError("이용권 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

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
        <div className="section-header">
          <span className="section-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M4 8h16v8H4z" />
              <path d="M8 8v8M16 8v8" />
            </svg>
          </span>
          <h2 className="main-title">나의 이용권</h2>
        </div>
        <div className="ticket-list">
          {loading && (
            <div style={{ padding: "24px", color: "#94a3b8" }}>불러오는 중...</div>
          )}
          {!loading && error && (
            <div style={{ padding: "24px", color: "#ef4444" }}>{error}</div>
          )}
          {!loading && !error && tickets.length === 0 && (
            <div style={{ padding: "24px", color: "#94a3b8" }}>등록된 이용권이 없습니다.</div>
          )}
          {tickets.map((ticket) => {
            const remaining = getRemainingLabel(ticket);
            const isExpired = remaining === "만료됨";
            const percent = getProgress(ticket);
            return (
              <button
                className={`ticket-card ticket-button ${isExpired ? "is-expired" : ""}`}
                key={ticket.id}
                type="button"
                onClick={() => openQr(ticket)}
              >
                <div className="ticket-header">
                  <div className="ticket-title-row">
                    <span className="ticket-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="img">
                        <path d="M5 7h14v10H5z" />
                        <path d="M8 7v10M16 7v10" />
                      </svg>
                    </span>
                    <div className="ticket-title">{ticket.title}</div>
                  </div>
                <div className={`ticket-remaining ${isExpired ? "is-expired" : ""}`}>
                  {remaining}
                </div>
              </div>
              <div className="ticket-period">{getPeriodLabel(ticket)}</div>
                <div className="ticket-progress">
                  <div className="ticket-bar">
                    <span
                      className="ticket-bar-fill"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                  <span className="ticket-percent">
                    <span className="num">{percent}</span>
                    <span className="unit">%</span>
                  </span>
                </div>
              </button>
            );
          })}
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
            {getRemainingLabel(activeTicket) === "만료됨" ? (
              <div className="qr-box expired-only">
                <p>
                  만료된 사용권이에요.
                  <br />
                  나의 이용권 메뉴에서 제거할까요?
                </p>
                <button className="refresh-button danger" type="button" onClick={handleDeleteExpired}>
                  네, 삭제할게요.
                </button>
              </div>
            ) : (
              <>
                <div className="qr-box">
                  <div className="qr-grid" aria-hidden="true" />
                  {timeLeft === 0 && (
                    <div className="qr-expired">
                      <p>유효 시간이 만료되었어요.</p>
                      <button
                        className="refresh-button"
                        type="button"
                        onClick={refreshQr}
                      >
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
                    <button
                      className="qr-action danger"
                      type="button"
                      onClick={() => {
                        if (onBankruptcy) {
                          onBankruptcy(activeTicket, expiresAt, true);
                        }
                      }}
                    >
                      시설 파산신고
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <MainNav active="tickets" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
