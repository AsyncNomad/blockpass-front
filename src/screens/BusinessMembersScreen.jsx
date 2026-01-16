import BusinessNav from "./BusinessNav.jsx";

const members = [
  { name: "김지은", pass: "3개월권", status: "이용중" },
  { name: "박지호", pass: "PT 10회권", status: "대기" },
  { name: "이하린", pass: "1개월권", status: "이용중" },
];

export default function BusinessMembersScreen({ onMembers, onMain, onMy }) {
  return (
    <div className="main-screen">
      <section className="main-section">
        <h2 className="main-title">회원 목록</h2>
        <div className="member-list">
          {members.map((member) => (
            <div className="member-card" key={member.name}>
              <div className="member-name">{member.name}</div>
              <div className="member-meta">{member.pass}</div>
              <span className="member-status">{member.status}</span>
            </div>
          ))}
        </div>
      </section>
      <BusinessNav active="members" onMembers={onMembers} onMain={onMain} onMy={onMy} />
    </div>
  );
}
