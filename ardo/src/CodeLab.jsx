import { useRef, useState, useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";

export default function CodeLab({ lang, strings }) {
  // Lang belirleme: prop > tarayıcı dili
  const currentLang = useMemo(() => {
    if (lang) return lang;
    const n = (navigator.language || "en").toLowerCase();
    return n.startsWith("tr") ? "tr" : "en";
  }, [lang]);

  // UI metinleri (strings prop'u yoksa buradakiler kullanılır)
  const L = useMemo(() => {
    const fallback = {
      tr: {
        title: "⚡ Code Lab",
        subtitle: "Canlı JavaScript editörü — çıktıları aşağıda gör.",
        run: "Çalıştır",
        clear: "Temizle",
        output: "Çıktı",
        running: "çalıştırılıyor...",
        ok: "✔️ Kod çalıştı, çıktı yok.",
        errPrefix: "❌ Hata: ",
        starter: `// Arda'nın mini JS lab'ı
// console.log ile çıktı al
function sum(a,b){ return a+b }
console.log("sum(2,5) =", sum(2,5));`
      },
      en: {
        title: "⚡ Code Lab",
        subtitle: "Live JavaScript editor — see outputs below.",
        run: "Run",
        clear: "Clear",
        output: "Output",
        running: "running...",
        ok: "✔️ Code executed, no output.",
        errPrefix: "❌ Error: ",
        starter: `// Arda's mini JS lab
// use console.log to print
function sum(a,b){ return a+b }
console.log("sum(2,5) =", sum(2,5));`
      }
    };
    // strings?.codelab varsa onunla override edebilirsin
    return (strings && strings.codelab) || fallback;
  }, [strings]);

  const T = L[currentLang] || L.en;

  const [code, setCode] = useState(T.starter);
  const [output, setOutput] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === "result") setOutput(e.data.payload);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Dil değiştiğinde starter kodu güncelle (kullanıcı kod yazdıysa bozma)
  useEffect(() => {
    setCode((prev) => (prev.trim() === "" || prev === L.en.starter || prev === L.tr.starter ? T.starter : prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLang]);

  const runCode = () => {
    setOutput(T.running);
    const iframe = iframeRef.current;
    const html = `
<!doctype html><meta charset="utf-8">
<script>
  (function(){
    const logs=[];
    const push = (x)=>{ logs.push(String(x)); };
    const origLog = console.log;
    console.log = (...args)=>{ origLog(...args); push(args.join(" ")); };

    try {
      (function(){ ${code} })();
      parent.postMessage({type:"result", payload: logs.join("\\n") || ${JSON.stringify(T.ok)}},"*");
    } catch(err){
      parent.postMessage({type:"result", payload: ${JSON.stringify(T.errPrefix)} + err.message},"*");
    }
  })();
</script>`;
    const blob = new Blob([html], { type: "text/html" });
    iframe.src = URL.createObjectURL(blob);
  };

  return (
    <div style={{maxWidth: 1200, margin: "2rem auto"}}>
      <h2 style={{color:"#ffdf6c", textShadow:"0 0 8px #ffdf6c"}}>{T.title}</h2>
      <p style={{opacity:.9, marginBottom:12}}>{T.subtitle}</p>

      <Editor
        height="50vh"
        defaultLanguage="javascript"
        value={code}
        onChange={(v)=>setCode(v ?? "")}
        theme="vs-dark"
        options={{
          fontLigatures: true,
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />

      <div style={{display:"flex", gap:12, marginTop:12}}>
        <button onClick={runCode} className="revo-button">{T.run}</button>
        <button onClick={()=>setOutput("")} className="pdf-button">{T.clear}</button>
      </div>

      <div style={{
        marginTop:16, padding:"12px 16px", borderRadius:12,
        background:"rgba(30,30,55,0.8)", color:"#fff",
        boxShadow:"0 4px 20px rgba(0,0,0,0.25)"
      }}>
        <div style={{opacity:.8, marginBottom:8}}>{T.output}</div>
        <pre style={{whiteSpace:"pre-wrap", margin:0}}>{output}</pre>
      </div>

      <iframe ref={iframeRef} title="sandbox" sandbox="allow-scripts" style={{display:"none"}} />
    </div>
  );
}
