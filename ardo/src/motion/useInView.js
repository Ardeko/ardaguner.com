import { useEffect, useState } from "react";

/* Eleman görünür alana bir kez girince true olur ve öyle kalır.
   Reveal.jsx ile aynı mantık; kanca hâlinde, ref'i dışarıdan alıyor. */
export default function useInView(ref, { threshold = 0.2, rootMargin = "0px" } = {}) {
  const [gorundu, setGorundu] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || gorundu) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setGorundu(true);
      return undefined;
    }
    const gozlemci = new IntersectionObserver(
      (girisler) => {
        if (girisler.some((g) => g.isIntersecting)) {
          setGorundu(true);
          gozlemci.disconnect();
        }
      },
      { threshold, rootMargin }
    );
    gozlemci.observe(el);
    return () => gozlemci.disconnect();
  }, [ref, threshold, rootMargin, gorundu]);

  return gorundu;
}
