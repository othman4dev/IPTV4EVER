
import "../assets/css/loading.css";

const Loading: React.FC = () => {
  return (
    <div className={`loading-root loaded`}>
      <div className="loading-bg-gradient" />
      <div className="loading-center">
        <div className="loading-logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="#ff3b3b" strokeWidth="6" opacity="0.15" />
            <circle
              className="loading-spinner"
              cx="40" cy="40" r="36"
              stroke="#ff3b3b"
              strokeWidth="6"
              strokeDasharray="226"
              strokeDashoffset="0"
              fill="none"
            />
            <circle cx="40" cy="40" r="12" fill="#ff3b3b" />
          </svg>
        </div>
        <div className="loading-title">
            <h1 className="loading-title-text">
                Hold on a second, we're getting things ready for you...
            </h1>
        </div>
      </div>
    </div>
  );
};

export default Loading;

