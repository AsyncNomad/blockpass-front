export default function BackButton({ onBack }) {
  return (
    <button className="back-button" type="button" onClick={onBack}>
      &lt;
    </button>
  );
}
