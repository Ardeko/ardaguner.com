import { useRef } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function Magnetic({ children, as: Tag = "button", className = "", strength = 0.3, ...rest }) {
  const nodeRef = useRef(null);

  const handleMouseMove = (event) => {
    if (prefersReducedMotion()) return;
    const node = nodeRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    node.style.transition = "transform 0.15s ease-out";
    node.style.transform = `translate(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px)`;
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
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Magnetic;
