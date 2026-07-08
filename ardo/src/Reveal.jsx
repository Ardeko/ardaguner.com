import { useEffect, useRef, useState } from "react";

function Reveal({ children, as: Tag = "div", className = "", delay = 0, style, ...rest }) {
  const nodeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const combinedClassName = ["reveal", isVisible ? "reveal-visible" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={nodeRef}
      className={combinedClassName}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms", ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
