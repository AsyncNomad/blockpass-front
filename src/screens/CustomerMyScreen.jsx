import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import MainNav from "./MainNav.jsx";
import api from "../utils/api";

export default function CustomerMyScreen({ onTickets, onMain, onMy, onLogout }) {
  const [profile, setProfile] = useState({ name: "", wallet_address: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const { address } = useAccount();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        setProfile(response.data || {});
      } catch (err) {
        console.error("프로필 조회 실패:", err);
        setError("프로필 정보를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const syncWallet = async () => {
      if (!address || profile.wallet_address || syncing) {
        return;
      }
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }
      try {
        setSyncing(true);
        await api.patch("/auth/profile", { wallet_address: address });
        setProfile((prev) => ({ ...prev, wallet_address: address }));
      } catch (err) {
        console.error("지갑 주소 동기화 실패:", err);
      } finally {
        setSyncing(false);
      }
    };
    syncWallet();
  }, [address, profile.wallet_address, syncing]);

  return (
    <div className="main-screen">
      <section className="main-section">
        <div className="profile-card">
          <div className="profile-avatar" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20a7 7 0 0 1 14 0" />
            </svg>
          </div>
          <div className="profile-details">
            <div className="profile-name">
              {loading ? "불러오는 중..." : `${profile.name || "고객"}님`}
            </div>
          </div>
        </div>
        <div className="my-card">
          <div className="my-card-header">
            <span className="my-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="img">
                <path d="M4 12l4-6 4 4 4-4 4 6-4 6-4-4-4 4-4-6z" />
              </svg>
            </span>
            <div className="my-label">메타마스크 지갑 주소</div>
          </div>
          <div className="my-value">
            {error
              ? error
              : profile.wallet_address || "등록된 지갑이 없습니다."}
          </div>
        </div>
        <button
          className="logout-button"
          type="button"
          onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user_role");
            localStorage.removeItem("user_name");
            localStorage.removeItem("currentScreen");
            if (onLogout) {
              onLogout();
            }
          }}
        >
          <span className="button-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <path d="M9 6v2H4v8h5v2H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
              <path d="M13 16l4-4-4-4" />
              <path d="M7 12h10" />
            </svg>
          </span>
          로그아웃
        </button>
      </section>
      <MainNav active="my" onTickets={onTickets} onMain={onMain} onMy={onMy} />
    </div>
  );
}
