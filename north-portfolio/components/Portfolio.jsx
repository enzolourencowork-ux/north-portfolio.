'use client';
import { useEffect, useMemo, useState } from 'react';

const Arrow = ({ diagonal = false, size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{diagonal ? <><path d="M5 19 19 5"/><path d="M8 5h11v11"/></> : <><path d="M4 12h16"/><path d="m13 5 7 7-7 7"/></>}</svg>;
const Play = ({ size = 19 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m8 4 13 8-13 8V4Z"/></svg>;
const Close = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 5 19 19M19 5 5 19"/></svg>;

function videoSource(url) {
  if (!url) return { kind: 'empty' };
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) return { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(u.pathname.slice(1))}?autoplay=1` };
    if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'm.youtube.com' || host === 'www.youtube-nocookie.com') {
      const id = u.searchParams.get('v') || (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/embed/') ? u.pathname.split('/')[2] : null);
      if (id) return { kind: 'embed', url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1` };
    }
    if (host === 'vimeo.com' || host === 'www.vimeo.com' || host === 'player.vimeo.com') {
      const parts = u.pathname.split('/').filter(Boolean);
      const id = parts.find(p => /^\d+$/.test(p));
      if (/^\d+$/.test(id)) return { kind: 'embed', url: `https://player.vimeo.com/video/${id}?autoplay=1` };
    }
    if (/\.(mp4|webm|mov)(\?|$)/i.test(u.pathname + u.search)) return { kind: 'file', url };
    return { kind: 'external', url };
  } catch { return { kind: 'empty' }; }
}

function Navbar({ contactUrl }) {
  const [open, setOpen] = useState(false);
  return <header className="site-header" id="inicio">
    <div className="header-inner wrap">
      <a href="#inicio" className="header-logo" aria-label="NORTH — início" onClick={() => setOpen(false)}><img src="/brand/north-wordmark-dark.png" alt="NORTH Produtora Audiovisual" /></a>
      <nav className={`header-links ${open ? 'open' : ''}`} aria-label="Menu principal">
        <a onClick={() => setOpen(false)} href="#projetos">PROJETOS</a><a onClick={() => setOpen(false)} href="#manifesto">MANIFESTO</a><a onClick={() => setOpen(false)} href="#expertise">O QUE FAZEMOS</a>
        <a onClick={() => setOpen(false)} href="#contato" className="mobile-contact">CONTATO</a>
      </nav>
      <a className="nav-cta" href="#contato"><span>VAMOS CRIAR</span><span className="nav-cta-line" aria-hidden="true"/></a>
      <button className="mobile-toggle" aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen(!open)}><span></span><span></span></button>
    </div>
  </header>;
}

function Hero() {
  return <section className="hero" aria-label="Apresentação da NORTH">
    <div className="wrap hero-topline"><span><span className="status-dot"/> INDEPENDENTE POR ESSÊNCIA</span><span>CRIATIVIDADE EM MOVIMENTO — BRASIL</span></div>
    <div className="wrap hero-layout">
      <div className="hero-copy">
        <div className="eyebrow">NORTH <span className="eyebrow-line"/> PRODUTORA AUDIOVISUAL</div>
        <h1>SIGA<br/>PARA O<br/><span>NORTE<span className="hero-period">.</span></span></h1>
        <div className="hero-copy-bottom"><p>Não seguimos fórmulas.<br/>Criamos novas direções para histórias que merecem ser vistas.</p><a href="#projetos" className="hero-discover" aria-label="Explorar projetos"><span>VER NOSSO TRABALHO</span><span className="hero-discover-rule" aria-hidden="true"/></a></div>
      </div>
      <div className="hero-visual">
        <div className="hero-photo"/>
        <div className="hero-visual-top"><span>NORTH / 001</span><span>VISÃO / MOVIMENTO</span></div>
        <div className="hero-visual-mark"><img src="/brand/north-mark-light.png" alt="Símbolo original NORTH"/></div>
        <div className="hero-visual-caption"><span>UMA VISÃO.</span><strong>INFINITAS POSSIBILIDADES.</strong></div>
        <div className="hero-photo-index">N° 001 / THE DIRECTION</div>
      </div>
    </div>
    <div className="wrap hero-bottom"><span>ESTRATÉGIA <i/> DIREÇÃO <i/> PRODUÇÃO <i/> PÓS</span><a href="#projetos">ROLE PARA EXPLORAR <span>↓</span></a></div>
  </section>;
}

function Marquee() {
  return <section className="marquee" aria-label="NORTH: imagens com direção, histórias em movimento">
    <div className="marquee-meta" aria-hidden="true"><span>NORTH — ESTÚDIO CRIATIVO</span><span>MANIFESTO EM MOVIMENTO / 001</span></div>
    <div className="marquee-viewport" aria-hidden="true">
      <div className="marquee-track">
        {Array.from({length: 2}).map((_, i) => <div className="marquee-sequence" key={i}>
          <span className="marquee-statement">IMAGENS COM <i>DIREÇÃO.</i></span>
          <span className="marquee-separator"/>
          <span className="marquee-statement outline">SIGA PARA O NORTE.</span>
          <span className="marquee-separator"/>
          <span className="marquee-statement">HISTÓRIAS EM <i>MOVIMENTO.</i></span>
          <span className="marquee-separator"/>
        </div>)}
      </div>
    </div>
    <div className="marquee-footer" aria-hidden="true"><span>CONCEITO</span><span>VISÃO</span><span>EXECUÇÃO</span></div>
  </section>;
}

function ProjectCard({ project, index, onOpen }) {
  return <button type="button" className={`project-card project-${index % 4}`} onClick={() => onOpen(project)} aria-label={`Ver projeto ${project.title}`}>
    <div className="project-image" style={project.cover_url ? {backgroundImage: `url("${project.cover_url.replace(/"/g, '%22')}")`} : {}}/>
    <div className="project-image-tint"/>
    <div className="project-top"><span>0{index + 1} / {project.category?.toUpperCase()}</span><span className="project-format">FILME / 9:16</span></div>
    <div className="project-info"><div className="project-client">{project.client || 'NORTH ORIGINAL'} {project.demo ? ' · CONCEITO' : ''}</div><h3>{project.title}</h3><div className="project-info-bottom"><span className="project-year">{project.year || 'NORTH'}</span><span className="project-view">EXPLORAR PROJETO</span></div></div>
  </button>;
}

function Projects({ projects, onOpen }) {
  const categories = useMemo(() => ['Todos', ...new Set(projects.map(p => p.category).filter(Boolean))], [projects]);
  const [active, setActive] = useState('Todos');
  const filtered = projects.filter(p => active === 'Todos' || p.category === active);
  return <section className="projects-section section-pad" id="projetos">
    <div className="wrap"><div className="section-top"><span className="section-index"><span className="green-square"/> 01 / PORTFÓLIO</span><span className="section-note">TRABALHOS & EXPLORAÇÕES VISUAIS</span></div>
      <div className="section-heading-row"><h2>O QUE A GENTE<br/><em>COLOCA NO MUNDO.</em></h2><div className="heading-aside"><img src="/brand/north-mark-dark.png" alt=""/><p>Ideias que ganham forma.<br/>Imagens que ganham significado.</p></div></div>
      <div className="filter-row"><div className="filters" role="group" aria-label="Filtrar projetos">{categories.map(c => <button type="button" className={active === c ? 'active' : ''} key={c} onClick={() => setActive(c)}>{c.toUpperCase()}</button>)}</div><span className="project-count">{String(filtered.length).padStart(2,'0')} PROJETOS</span></div>
      {projects.some(p => p.demo) && <p className="demo-notice">PROJETOS-CONCEITO PARA VISUALIZAÇÃO. SUBSTITUA PELOS SEUS VÍDEOS NO PAINEL ADMINISTRATIVO.</p>}
      <div className="project-grid">{filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} onOpen={onOpen}/>)}</div>
      {!filtered.length && <div className="empty-projects">NOVAS HISTÓRIAS A CAMINHO. <span>↗</span></div>}
    </div>
  </section>;
}

function Manifesto() {
  return <section className="manifesto-section section-pad" id="manifesto"><div className="wrap">
    <div className="section-top dark"><span className="section-index"><span className="green-square"/> 02 / MANIFESTO</span><span className="section-note">NOSSO PONTO DE VISTA</span></div>
    <div className="manifesto-layout"><div className="manifesto-main"><span className="manifesto-pre">A DIREÇÃO FAZ A DIFERENÇA.</span><h2>NÃO É SÓ<br/>SOBRE <span>VER.</span><br/>É SOBRE<br/><i>SENTIR.</i></h2></div><div className="manifesto-side"><img src="/brand/north-mark-light.png" alt=""/><p>Acreditamos no poder de uma boa história. Na força de uma imagem que fica. Na ousadia de criar algo que ainda não existe.</p><p>Somos uma produtora audiovisual para quem entende que cada projeto tem um norte — e que encontrá-lo muda tudo.</p><a href="#expertise">CONHEÇA NOSSO OLHAR <Arrow diagonal size={18}/></a></div></div>
    <div className="manifesto-bottom"><span>NORTH / O OLHAR QUE MOVE</span><span>↑ SIGA PARA O NORTE</span></div>
  </div></section>;
}

const services = [
  { number:'01', title:'DIREÇÃO CRIATIVA', body:'A ideia antes da imagem. Conceito, roteiro e linguagem visual com intenção.' },
  { number:'02', title:'PRODUÇÃO AUDIOVISUAL', body:'Da primeira luz ao último take. Captação, direção e execução com personalidade.' },
  { number:'03', title:'PÓS-PRODUÇÃO', body:'O ritmo que transforma cenas em histórias. Montagem, cor, som e acabamento.' },
];
function Expertise() {
  return <section className="expertise-section section-pad" id="expertise"><div className="wrap"><div className="section-top"><span className="section-index"><span className="green-square"/> 03 / O QUE FAZEMOS</span><span className="section-note">DO CONCEITO AO ÚLTIMO FRAME</span></div>
    <div className="expertise-head"><h2>DO PRIMEIRO<br/>INSIGHT AO <em>PLAY.</em></h2><p>Não existe uma única forma de contar uma história. Existe a direção certa para cada uma.</p></div>
    <div className="service-list">{services.map(s=><div className="service-item" key={s.number}><span>{s.number} /</span><h3>{s.title}</h3><p>{s.body}</p><span className="service-icon"><Arrow diagonal size={24}/></span></div>)}</div>
  </div></section>;
}

function Contact({ contactUrl }) {
  return <section className="contact-section" id="contato"><div className="wrap contact-inner"><div className="contact-top"><span><span className="contact-dot"/> 04 / PRÓXIMA DIREÇÃO</span><span>NOVOS PROJETOS, NOVAS HISTÓRIAS</span></div>
    <h2>SUA IDEIA TEM<br/><span>UM NORTE.</span></h2><div className="contact-bottom"><p>Tem uma história que merece sair do papel?<br/>A gente encontra o caminho juntos.</p>{contactUrl ? <a href={contactUrl} target="_blank" rel="noopener noreferrer" className="contact-button">VAMOS CONVERSAR <Arrow diagonal size={25}/></a> : <span className="contact-button contact-unconfigured" title="Configure NEXT_PUBLIC_CONTACT_URL para ativar">CONTATO EM BREVE <Arrow diagonal size={25}/></span>}</div>
    <img className="contact-watermark" src="/brand/north-mark-dark.png" alt=""/>
  </div></section>;
}
function Footer() { return <footer className="footer"><div className="wrap"><div className="footer-main"><a href="#inicio"><img src="/brand/north-wordmark-light.png" alt="NORTH Produtora Audiovisual"/></a><div><p>IDEIAS QUE APONTAM PARA FRENTE.</p><a href="/admin/login">ACESSO RESTRITO <Arrow diagonal size={13}/></a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} NORTH. TODOS OS DIREITOS RESERVADOS.</span><span>FEITO PARA QUEM NÃO PARA DE CRIAR.</span></div></div></footer>; }

function VideoModal({ project, onClose }) {
  const source = videoSource(project?.video_url);
  useEffect(() => {
    if (!project) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [project, onClose]);
  if (!project) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><div className="video-modal" role="dialog" aria-modal="true" aria-label={project.title} onMouseDown={e => e.stopPropagation()}><div className="modal-header"><span>NORTH / PROJETO {project.year || ''}</span><button onClick={onClose} aria-label="Fechar"><Close/></button></div><div className="modal-player">{source.kind === 'embed' ? <iframe src={source.url} title={`Vídeo vertical: ${project.title}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/> : source.kind === 'file' ? <video src={source.url} controls autoPlay playsInline/> : <div className="modal-no-video" style={project.cover_url ? {backgroundImage: `linear-gradient(180deg, rgba(12,17,14,.2),rgba(12,17,14,.86)), url("${project.cover_url.replace(/"/g, '%22')}")`} : {}}><img src="/brand/north-mark-light.png" alt=""/><span>{source.kind === 'external' ? 'ASSISTA AO FILME NO LINK' : 'NOVA HISTÓRIA EM BREVE'}</span>{source.kind === 'external' && <a href={source.url} target="_blank" rel="noopener noreferrer">ABRIR VÍDEO <Arrow diagonal size={18}/></a>}</div>}</div><div className="modal-details"><div><span>PORTFÓLIO / {project.category?.toUpperCase()}</span><h3>{project.title}</h3><div className="modal-client">{project.client?.toUpperCase() || 'NORTH'} — {project.year || 'FILME'}</div></div><p>{project.description || 'Uma nova história com a assinatura NORTH.'}</p><div className="modal-signature">NORTH / SIGA PARA O NORTE.</div></div></div></div>;
}

export default function Portfolio({ projects, contactUrl }) {
  const [selected, setSelected] = useState(null);
  return <><Navbar contactUrl={contactUrl}/><main><Hero/><Marquee/><Projects projects={projects} onOpen={setSelected}/><Manifesto/><Expertise/><Contact contactUrl={contactUrl}/></main><Footer/><VideoModal project={selected} onClose={() => setSelected(null)}/></>;
}
