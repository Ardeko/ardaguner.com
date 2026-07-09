import { useRef } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function Tilt({ children, as: Tag = "div", className = "", strength = 8, ...rest }) {
  const nodeRef = useRef(null);

  const handleMouseMove = (event) => {
    if (prefersReducedMotion()) return;
    const node = nodeRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.transition = "transform 0.15s ease-out";
    node.style.transform = `perspective(900px) rotateX(${(-y * strength).toFixed(2)}deg) rotateY(${(x * strength).toFixed(2)}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    const node = nodeRef.current;
    if (!node) return;
    node.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
    node.style.transform = "";
  };

  return (
    <Tag
      ref={nodeRef}
      className={`tilt${className ? ` ${className}` : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Tilt;
