import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* Hesap silme sayfasının statik kopyası.

   SPA tek bir index.html basıyor; /torpidodan/hesap-silme açıldığında
   ham HTML'de ana sayfanın başlığı ve açıklaması görünüyordu. Mağaza
   denetleyicileri ve bağlantı önizlemeleri JS çalıştırmadan okuyor.
   Bu eklenti derlenmiş index.html'in bir kopyasını sayfaya özgü
   <title> / description / canonical / og ile yazıyor. Cloudflare Pages
   torpidodan/hesap-silme.html dosyasını uzantısız adresten sunuyor.
   Metinler AccountDeletion.jsx'teki DELETION_META ile aynı kalmalı. */
const SAYFALAR = [
  {
    file: 'torpidodan/hesap-silme.html',
    url: 'https://ardaguner.com/torpidodan/hesap-silme',
    title: 'Torpidodan — Hesap ve veri silme · Account & data deletion',
    description:
      'Torpidodan hesabını ve çevrimiçi verilerini silme: uygulama içinden anında ya da uygulamayı sildiysen e-postayla. How to delete your Torpidodan account and online data.',
  },
]

const kacir = (s) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function statikSayfalar() {
  return {
    name: 'statik-sayfalar',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const kok = bundle['index.html']
      if (!kok) return
      const html = String(kok.source)
      for (const s of SAYFALAR) {
        const title = kacir(s.title)
        const desc = kacir(s.description)
        const out = html
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
          .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${s.url}$2`)
          .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${s.url}$2`)
          .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${desc}$2`)
          .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
          .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${desc}$2`)
        this.emitFile({ type: 'asset', fileName: s.file, source: out })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), statikSayfalar()],
  assetsInclude: ['**/*.JPG', '**/*.jpeg']
})
