import { useEffect, useState } from "react";
import BusinessNav from "./BusinessNav.jsx";
import api from "../utils/api";

export default function BusinessMembersScreen({ onMembers, onMain, onMy }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/business/members");
        setMembers(response.data || []);
      } catch (err) {
        console.error("회원 목록 조회 실패:", err);
        setError("회원 목록을 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  return (
    <div className="main-screen">
      <section className="main-section">
        <h2 className="main-title">회원 목록</h2>
        <div className="member-list">
          {loading && (
            <div style={{ padding: "24px", color: "#94a3b8" }}>불러오는 중...</div>
          )}
          {!loading && error && (
            <div style={{ padding: "24px", color: "#ef4444" }}>{error}</div>
          )}
          {!loading && !error && members.length === 0 && (
            <div style={{ padding: "24px", color: "#94a3b8" }}>등록된 회원이 없습니다.</div>
          )}
          {!loading &&
            !error &&
            members.map((member) => (
            <div className="member-card" key={member.user_id || member.name}>
              <div className="member-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <circle cx="12" cy="8" r="3" />
                  <path d="M6 19a6 6 0 0 1 12 0" />
                </svg>
              </div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-meta">
                  {(member.passes || []).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <BusinessNav active="members" onMembers={onMembers} onMain={onMain} onMy={onMy} />
    </div>
  );
}
