import 'server-only';
import { createClient } from '@supabase/supabase-js';

export function database() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export const demoProjects = [
  { id: 'demo-01', title: 'Além do horizonte', client: 'Filme conceito', category: 'Documental', year: '2026', description: 'Algumas histórias não cabem em um destino. Um exercício de narrativa sobre o caminho, o tempo e a beleza de seguir em frente.', cover_url: '/media/coast-reference.jpg', video_url: '', featured: true, published: true, demo: true },
  { id: 'demo-02', title: 'O que nos move', client: 'Filme conceito', category: 'Campanha', year: '2026', description: 'Ritmo, intenção e movimento. Uma ideia visual sobre aquilo que nos tira do lugar.', cover_url: '/media/project-motion.svg', video_url: '', featured: false, published: true, demo: true },
  { id: 'demo-03', title: 'Forma & essência', client: 'Filme conceito', category: 'Institucional', year: '2026', description: 'O olhar encontra detalhes que o óbvio não alcança. Um estudo de textura, luz e identidade.', cover_url: '/media/project-form.svg', video_url: '', featured: false, published: true, demo: true },
  { id: 'demo-04', title: 'Entre pessoas', client: 'Filme conceito', category: 'Conteúdo', year: '2026', description: 'No centro de toda imagem existe uma conexão. Um retrato visual da energia que nos aproxima.', cover_url: '/media/project-people.svg', video_url: '', featured: false, published: true, demo: true },
];

export async function listProjects(admin = false) {
  const db = database();
  if (!db) return admin ? [] : demoProjects;
  let query = db.from('projects').select('*').order('featured', { ascending: false }).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (!admin) query = query.eq('published', true);
  const { data, error } = await query;
  if (error) throw new Error('Não foi possível consultar os projetos.');
  return data || [];
}

export const FIELDS = ['title','client','category','year','description','brief','objective','tone','video_url','cover_url','featured','published','sort_order'];
export function sanitizeProject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Dados inválidos.');
  const out = {};
  for (const key of FIELDS) {
    if (!(key in input)) continue;
    if (['featured','published'].includes(key)) out[key] = Boolean(input[key]);
    else if (key === 'sort_order') out[key] = Number.isInteger(Number(input[key])) ? Number(input[key]) : 0;
    else {
      if (typeof input[key] !== 'string') throw new Error(`Campo ${key} inválido.`);
      out[key] = input[key].trim().slice(0, key === 'description' || key === 'brief' ? 3000 : 500);
    }
  }
  if ('title' in out && !out.title) throw new Error('Informe o nome do projeto.');
  for (const field of ['video_url','cover_url']) {
    if (out[field]) {
      try {
        const u = new URL(out[field], 'https://north.local');
        if (!['http:', 'https:'].includes(u.protocol)) throw new Error();
        if (out[field].startsWith('/') && !out[field].startsWith('//')) continue;
        if (!/^https?:\/\//i.test(out[field])) throw new Error();
      } catch { throw new Error(`URL inválida: ${field}`); }
    }
  }
  return out;
}
