import Image from "next/image";

const LoadingFallback = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      alignItems: "center",
      justifyContent: "center",
      background: "#ffffff",
      color: "var(--color-primary)",
      fontSize: "18px",
      fontWeight: 600,
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
      padding: "32px 16px",
    }}
  >
    <Image
      src="/images/logo.png"
      alt="책의 계절, 동구 로고"
      width={120}
      height={150}
      style={{
        animation: "float 3.2s ease-in-out infinite",
        filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.08))",
      }}
    />
    <span>책의 계절, 동구 로딩 중...</span>
    <style>{`
      @keyframes float {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
    `}</style>
  </div>
);

export default LoadingFallback;
