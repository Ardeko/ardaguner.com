const GH = 'https://github.com/Ardeko';

export const CATEGORIES = ['game', 'app', 'web', 'corporate', 'rnd'];

export const STATUSES = ['live', 'source', 'wip', 'restricted'];

export const PROJECTS = [
  {
    id: 'unichain',
    year: 2023,
    month: 1,
    category: 'app',
    status: 'source',
    platforms: 'WEB',
    tech: ['Blockchain'],
    image: null,
    unverified: true,
    links: { github: `${GH}/unichain` },
  },
  {
    id: 'protocol',
    year: 2023,
    month: 7,
    category: 'game',
    status: 'source',
    platforms: 'WEB',
    tech: ['JavaScript', 'HTML5 Canvas'],
    image: null,
    links: { github: `${GH}/protocol` },
  },
  {
    id: 'ardobot',
    year: 2023,
    month: 8,
    category: 'app',
    status: 'source',
    platforms: 'DISCORD',
    tech: ['Node.js', 'Discord.js', 'AI'],
    image: null,
    links: { github: `${GH}/ardobot` },
  },
  {
    id: 'teknofest',
    year: 2023,
    category: 'rnd',
    status: 'source',
    platforms: 'EMBEDDED',
    tech: ['Python', 'OpenCV'],
    image: null,
    links: { github: 'https://github.com/EVA-Submarine-Team' },
  },
  {
    id: 'wordeko',
    year: 2024,
    month: 4,
    category: 'game',
    status: 'source',
    platforms: 'WEB',
    tech: ['JavaScript'],
    image: null,
    links: { github: `${GH}/wordeko` },
  },
  {
    id: 'legendOfRey',
    year: 2024,
    category: 'game',
    status: 'source',
    platforms: 'DESKTOP',
    tech: ['Python', 'Pygame'],
    image: '/games/legend-of-rey.jpg',
    links: { github: `${GH}/Legend-Of-Rey` },
  },
  {
    id: 'renault',
    year: 2024,
    category: 'corporate',
    status: 'restricted',
    platforms: 'MOBILE',
    tech: [],
    image: null,
    links: {},
  },
  {
    id: 'ardaguner',
    year: 2024,
    month: 11,
    category: 'web',
    status: 'live',
    platforms: 'WEB',
    tech: ['React', 'Vite'],
    image: '/shots/ardaguner.webp',
    links: { github: `${GH}/ardaguner.com`, live: 'https://ardaguner.com' },
  },
  {
    id: 'stok',
    year: 2025,
    month: 6,
    category: 'corporate',
    status: 'source',
    platforms: 'WEB',
    tech: ['C#', 'ASP.NET Core MVC', 'MSSQL'],
    image: null,
    links: { github: `${GH}/StokEkstresiApp` },
  },
  {
    id: 'revo',
    featured: 2,
    year: 2025,
    month: 7,
    category: 'app',
    status: 'live',
    platforms: 'WEB · WINDOWS',
    tech: ['SignalR', 'WebRTC', 'React'],
    image: '/games/revo.jpg',
    links: {
      live: 'https://ardekostudios.xyz',
      download: `${GH}/Revo/releases/latest/download/REVO-Setup.exe`,
      github: `${GH}/Revo`,
    },
  },
  {
    id: 'nebula',
    year: 2025,
    month: 7,
    category: 'game',
    status: 'source',
    platforms: 'WEB',
    tech: ['React', 'Phaser 3', 'FastAPI', 'MongoDB'],
    image: null,
    links: { github: `${GH}/Nebula` },
  },
  {
    id: 'switchMaster',
    featured: 3,
    year: 2026,
    month: 5,
    category: 'game',
    status: 'live',
    platforms: 'IOS · ANDROID',
    tech: ['Unity', 'iOS', 'Android'],
    image: '/games/switch.jpg',
    links: {
      appStore:
        'https://apps.apple.com/tr/app/switch-master-railway/id6770972534?l=tr',
      googlePlay:
        'https://play.google.com/store/apps/details?id=com.ardeko.switchmaster&pcampaignid=web_share',
    },
  },
  {
    id: 'ardekostudios',
    year: 2026,
    month: 5,
    category: 'web',
    status: 'live',
    platforms: 'WEB',
    tech: ['React 19', 'Vite 8', 'Tailwind v4'],
    image: '/shots/ardekostudios.webp',
    links: {
      github: `${GH}/ardekostudios.com`,
      live: 'https://ardekostudios.com',
    },
  },
  {
    id: 'kafa',
    year: 2026,
    month: 6,
    category: 'game',
    status: 'wip',
    platforms: 'IOS · ANDROID',
    tech: ['Godot'],
    image: '/games/kafa.jpg',
    links: {},
  },
  {
    id: 'rushville',
    year: 2026,
    month: 6,
    category: 'game',
    status: 'live',
    platforms: 'IOS · ANDROID',
    tech: ['Godot'],
    image: '/games/rushville.jpg',
    unverified: true,
    links: {},
  },
  {
    id: 'skyline',
    year: 2026,
    month: 6,
    category: 'game',
    status: 'live',
    platforms: 'IOS · ANDROID',
    tech: ['Godot'],
    image: '/games/skyline.jpg',
    links: {},
  },
  {
    id: 'sarteks',
    featured: 4,
    year: 2026,
    month: 6,
    category: 'corporate',
    status: 'live',
    platforms: 'WEB',
    tech: ['Next.js 16', 'TypeScript', 'Tailwind v4', 'Matter.js'],
    image: '/shots/sarteks.webp',
    links: { live: 'https://sarteks.com.tr' },
  },
  {
    id: 'forza',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'live',
    platforms: 'WEB · BROWSER',
    tech: ['JavaScript', 'Canvas'],
    image: '/games/forza.jpg',
    unverified: true,
    links: { play: '/forza-orbit.html' },
  },
  {
    id: 'apex',
    featured: 1,
    year: 2026,
    month: 8,
    category: 'game',
    status: 'live',
    platforms: 'WEB · BROWSER',
    tech: ['JavaScript', 'Canvas', 'Firebase RTDB', 'Netcode'],
    image: '/games/apex.webp',
    links: { play: '/apex-shift/index.html' },
  },
  {
    id: 'dny',
    year: 2026,
    month: 8,
    category: 'corporate',
    status: 'live',
    platforms: 'WEB',
    tech: ['HTML', 'CSS', 'SEO'],
    image: null,
    links: {
      live: 'https://dny.com.tr/',
    },
  },
  {
    id: 'torpidodan',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'live',
    platforms: 'IOS · ANDROID',
    tech: ['React', 'TypeScript', 'Capacitor'],
    image: '/games/torpidodan.svg',
    links: {
      appStore: 'https://apps.apple.com/app/torpidodan/id6807162427',
    },
  },
  {
    id: 'decoy',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'live',
    platforms: 'WEB · ONLINE',
    tech: ['JavaScript', 'Firebase', 'Firestore'],
    image: '/games/decoy.svg',
    links: { play: 'https://ardekostudios.com/decoy/' },
  },
  {
    id: 'erafront',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'wip',
    platforms: 'WINDOWS',
    tech: ['Delphi', 'FireMonkey'],
    image: null,
    links: {},
  },
  {
    id: 'metroray',
    year: 2026,
    month: 8,
    category: 'game',
    status: 'wip',
    platforms: 'WEB',
    tech: ['Phaser 3', 'Matter.js', 'JavaScript'],
    image: null,
    links: {},
  },
];

/* --- Seçiciler ----------------------------------------------------- */

export const featuredProjects = () =>
  PROJECTS.filter((p) => p.featured).sort((a, b) => a.featured - b.featured);

export const stats = () => ({
  projects: PROJECTS.length,
  live: PROJECTS.filter((p) => p.status === 'live').length,
  games: PROJECTS.filter((p) => p.category === 'game').length,
});

export const withImage = () => PROJECTS.filter((p) => p.image);

const monthOf = (p) => p.month ?? 6;

export const chronological = () =>
  PROJECTS.filter((p) => p.year).sort(
    (a, b) => b.year - a.year || monthOf(b) - monthOf(a)
  );

export function groupByYear(items = chronological()) {
  const years = [];

  for (const item of items) {
    const last = years[years.length - 1];

    if (last && last.year === item.year) {
      last.items.push(item);
    } else {
      years.push({
        year: item.year,
        items: [item],
      });
    }
  }

  return years;
}