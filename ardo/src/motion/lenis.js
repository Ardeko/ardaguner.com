/* Lenis örneği modül düzeyinde tutuluyor: mobil menü / komut paleti
   açılınca kaydırmayı durdurmak, "başa dön" ve palet bölüme atlarken
   kullanmak için. Örneği SmoothScroll.jsx kuruyor ve buraya yazıyor.
   (Bileşen dosyasından sabit dışa aktarmak Vite'ın hızlı yenilemesini
   bozduğu için ayrı dosyada.) */

export const lenisRef = { current: null };

/** Sayfanın başına — Lenis varsa yumuşak, yoksa tarayıcının kendisi. */
export function basaDon() {
  if (lenisRef.current) lenisRef.current.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0 });
}
