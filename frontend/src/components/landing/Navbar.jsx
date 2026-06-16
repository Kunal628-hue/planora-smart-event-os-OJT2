import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <style>{`
        .flammini-hover {
          position: relative;
          display: inline-block;
          overflow: hidden;
        }
        .flammini-hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: #f97316;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }
        .flammini-hover:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      `}</style>
      <div style={{ pointerEvents: "auto", display: "flex", gap: "2.5rem", alignItems: "center" }}>
        <Link to="/login" style={{ color: "#fff", textDecoration: "none", fontWeight: 600, fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em" }} className="flammini-hover">Log in</Link>
      </div>
    </>
  );
}
