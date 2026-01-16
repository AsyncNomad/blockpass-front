export default function BusinessScreen() {
  return (
    <div className="card flow-screen" key="business">
      <div className="greeting-block">
        <h2 className="greeting-title">홍길동 사장님</h2>
        <p className="greeting-sub">
          사업장 정보를 등록하기 위해 필요한 몇 가지 질문에 답변해주세요.
        </p>
      </div>
      <button className="next-button" type="button">
        다음
      </button>
    </div>
  );
}
