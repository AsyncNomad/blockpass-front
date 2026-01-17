export default function LoadingScreen({ message }) {
  return (
    <section className="main-section loading-page">
      <div className="chain-track" aria-hidden="true">
        <div className="chain-strip">
          <div className="chain-group">
            <span className="chain-block" />
            <span className="chain-link" />
            <span className="chain-block" />
            <span className="chain-link" />
            <span className="chain-block" />
            <span className="chain-link" />
          </div>
          <div className="chain-group">
            <span className="chain-block" />
            <span className="chain-link" />
            <span className="chain-block" />
            <span className="chain-link" />
            <span className="chain-block" />
            <span className="chain-link" />
          </div>
        </div>
      </div>
      <p className="loading-copy">
        {message.split(/\\n|\n/).map((line, index) => (
          <span key={index} className="loading-line">
            {line}
          </span>
        ))}
      </p>
    </section>
  );
}
