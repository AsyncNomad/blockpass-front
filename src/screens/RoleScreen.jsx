export default function RoleScreen({ onBusiness, onCustomer }) {
  return (
    <div className="card role-card" key="role">
      <p className="card-copy">역할을 선택해주세요.</p>
      <div className="role-grid">
        <button className="role" type="button" onClick={onBusiness}>
          <span className="role-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <rect x="4" y="8" width="16" height="10" rx="2" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
              <path d="M4 12h16" />
            </svg>
          </span>
          <span className="role-title">사업자</span>
          <span className="role-desc">
            이용권 판매자를 위한 정산, 예치, 계약 관리 기능을 제공해요.
          </span>
        </button>
        <button className="role" type="button" onClick={onCustomer}>
          <span className="role-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="img">
              <circle cx="12" cy="8" r="3" />
              <path d="M5 19a7 7 0 0 1 14 0" />
              <path d="M7 19h10" />
            </svg>
          </span>
          <span className="role-title">고객</span>
          <span className="role-desc">
            내 이용권을 블록체인에 담아 보호해요.
          </span>
        </button>
      </div>
    </div>
  );
}
