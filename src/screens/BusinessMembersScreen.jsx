import BusinessNav from "./BusinessNav.jsx";

const members = [
  { name: "김지은", pass: "3개월권" },
  { name: "박지호", pass: "PT 10회권" },
  { name: "이하린", pass: "1개월권" },
];

export default function BusinessMembersScreen({ onMembers, onMain, onMy }) {
  return (
    <div className="main-screen">
      <section className="main-section">
        <h2 className="main-title">회원 목록</h2>
        <div className="member-list">
          {members.map((member) => (
            <div className="member-card" key={member.name}>
              <div className="member-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" role="img">
                  <circle cx="12" cy="8" r="3" />
                  <path d="M6 19a6 6 0 0 1 12 0" />
                </svg>
              </div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-meta">{member.pass}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <BusinessNav active="members" onMembers={onMembers} onMain={onMain} onMy={onMy} />
    </div>
  );
}
