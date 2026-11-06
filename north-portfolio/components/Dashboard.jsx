'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const fresh = () => ({ title:'', client:'', category:'Institucional', year:String(new Date().getFullYear()), description:'', brief:'', objective:'', tone:'Cinematográfico, autoral e sofisticado', video_url:'', cover_url:'', featured:false, published:true, sort_order:0 });
const CATEGORIES = ['Institucional','Campanha','Documental','Conteúdo','Evento','Videoclipe','Filme','Outro'];

export default function Dashboard({ email }) {
  const [projects,setProjects] = useState([]);
  const [form,setForm] = useState(fresh);
  const [editing,setEditing] = useState(null);
  const [tab,setTab] = useState('projects');
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [generating,setGenerating] = useState(false);
  const [uploading,setUploading] = useState('');
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const [configured,setConfigured] = useState(false);
  const change = (key,value) => setForm(f=>({...f,[key]:value}));

  async function reload() {
    try { const r=await fetch('/api/projects?admin=1',{cache:'no-store'}); const j=await r.json(); if(!r.ok) throw new Error(j.error); setProjects(j.projects || []); setConfigured(Boolean(j.configured)); }
    catch(e){setError(e.message);} finally{setLoading(false);}
  }
  useEffect(()=>{reload();},[]);
  function startNew(){setForm(fresh());setEditing(null);setError('');setMessage('');setTab('editor');}
  function edit(project){setForm({...fresh(),...project});setEditing(project.id);setError('');setMessage('');setTab('editor');window.scrollTo({top:0,behavior:'smooth'});}
  async function generate(){
    setError('');setMessage('');setGenerating(true);
    try {const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const j=await r.json();if(!r.ok)throw new Error(j.error||'Falha ao gerar.');change('description',j.description);setMessage('Descrição gerada. Revise e salve o projeto.');}
    catch(e){setError(e.message);}finally{setGenerating(false);}
  }
  async function save(e){
    e.preventDefault();setSaving(true);setError('');setMessage('');
    try {const r=await fetch(editing?`/api/projects/${editing}`:'/api/projects',{method:editing?'PATCH':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const j=await r.json();if(!r.ok)throw new Error(j.error||'Não foi possível salvar.');await reload();setMessage('Projeto salvo com sucesso.');setEditing(j.project.id);}
    catch(e){setError(e.message);}finally{setSaving(false);}
  }
  async function remove(project){
    if(!window.confirm(`Excluir definitivamente "${project.title}"?`))return;
    setError('');setMessage('');
    try{const r=await fetch(`/api/projects/${project.id}`,{method:'DELETE'});const j=await r.json();if(!r.ok)throw new Error(j.error||'Erro ao excluir.');await reload();setMessage('Projeto excluído.');}
    catch(e){setError(e.message);}
  }
  async function upload(file,kind){
    if(!file)return;
    setError('');setMessage('');setUploading(kind);
    try{
      const sign=await fetch('/api/upload/sign',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,type:file.type,size:file.size})});
      const data=await sign.json();if(!sign.ok)throw new Error(data.error||'Não foi possível preparar o envio.');
      const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if(!url||!key)throw new Error('Configure as variáveis públicas do Supabase.');
      const supabase=createClient(url,key);
      const {error:uploadError}=await supabase.storage.from('north-media').uploadToSignedUrl(data.path,data.token,file,{contentType:file.type,upsert:false});
      if(uploadError)throw new Error(uploadError.message);
      change(kind==='video'?'video_url':'cover_url',data.publicUrl);
      setMessage(`${kind==='video'?'Vídeo':'Capa'} enviado. Clique em SALVAR PROJETO para publicar a alteração.`);
    }catch(e){setError(e.message);}finally{setUploading('');}
  }
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});window.location.href='/admin/login';}
  return <main className="dashboard"><aside className="admin-sidebar"><a href="/" target="_blank" rel="noopener noreferrer"><img src="/brand/north-wordmark-light.png" alt="NORTH"/></a><div className="admin-nav-caption">WORKSPACE / 001</div><nav aria-label="Administração"><button className={tab==='projects'?'selected':''} onClick={()=>{setTab('projects');setMessage('');setError('');}}><span>▦</span> PROJETOS <b>{projects.length}</b></button><button className={tab==='editor'?'selected':''} onClick={startNew}><span>＋</span> NOVO PROJETO</button></nav><div className="sidebar-bottom"><div className="sidebar-avatar">N</div><div className="sidebar-user"><strong>ADMIN NORTH</strong><span>{email}</span></div><button className="logout-button" onClick={logout} title="Sair">↗</button></div></aside>
    <section className="admin-main"><div className="admin-topbar"><span>PAINEL NORTH <span className="admin-slash">/</span> {tab==='projects'?'PROJETOS':'EDITOR CRIATIVO'}</span><a href="/" target="_blank" rel="noopener noreferrer">VER SITE ↗</a></div><div className="admin-content"><div className="admin-heading"><div><div className="admin-eyebrow"><span className="green-square"/> ÁREA DE DIREÇÃO</div><h1>{tab==='projects'?'Seu portfólio.':editing?'Editar projeto.':'Nova história.'}</h1><p>{tab==='projects'?'Gerencie os trabalhos que o mundo vai conhecer.':'Adicione um vídeo, conte a ideia e deixe a IA ajudar com as palavras.'}</p></div>{tab==='projects'&&<button className="admin-primary" onClick={startNew}>+ ADICIONAR PROJETO</button>}</div>
    {!configured&&<div className="admin-setup-warning"><strong>ARMAZENAMENTO NÃO CONFIGURADO</strong><span>O site exibe projetos demonstrativos. Para salvar e publicar seus próprios vídeos, configure o Supabase conforme o README.</span></div>}
    {error&&<div className="admin-alert error" role="alert">{error}<button onClick={()=>setError('')}>×</button></div>}
    {message&&<div className="admin-alert success" role="status">{message}<button onClick={()=>setMessage('')}>×</button></div>}
    {tab==='projects'?<div className="admin-projects"><div className="admin-list-header"><span>PROJETOS CADASTRADOS</span><span>STATUS / AÇÕES</span></div>{loading?<div className="admin-empty">CARREGANDO PROJETOS...</div>:projects.length?projects.map(p=><div className="admin-project-row" key={p.id}><div className="admin-thumb" style={p.cover_url?{backgroundImage:`url("${p.cover_url.replace(/"/g,'%22')}")`}:{}}/><div className="admin-project-meta"><strong>{p.title}</strong><span>{p.client||'NORTH'} / {p.category}</span></div><span className={`admin-publish ${p.published?'live':'draft'}`}>{p.published?'PUBLICADO':'RASCUNHO'}</span><button onClick={()=>edit(p)}>EDITAR ↗</button><button className="delete-link" onClick={()=>remove(p)}>EXCLUIR</button></div>):<div className="admin-empty"><span>N° 01</span><h3>Ainda não há projetos.</h3><p>Comece adicionando o primeiro trabalho ao portfólio.</p><button className="admin-primary" onClick={startNew}>CRIAR PRIMEIRO PROJETO ↗</button></div>}</div>
    :<form onSubmit={save} className="editor-layout"><div className="editor-fields"><div className="editor-card"><div className="editor-card-head"><span>01 / INFORMAÇÕES DO PROJETO</span><span>INÍCIO</span></div><div className="editor-card-body"><div className="admin-field"><label>NOME DO PROJETO *</label><input required value={form.title} onChange={e=>change('title',e.target.value)} placeholder="Ex.: Um novo olhar sobre o mundo" maxLength={160}/></div><div className="field-pair"><div className="admin-field"><label>CLIENTE / MARCA</label><input value={form.client} onChange={e=>change('client',e.target.value)} placeholder="Nome do cliente"/></div><div className="admin-field"><label>CATEGORIA</label><select value={form.category} onChange={e=>change('category',e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div></div><div className="field-pair"><div className="admin-field"><label>ANO</label><input value={form.year} onChange={e=>change('year',e.target.value)} placeholder="2026"/></div><div className="admin-field"><label>ORDEM DE EXIBIÇÃO</label><input type="number" value={form.sort_order} onChange={e=>change('sort_order',Number(e.target.value))}/></div></div></div></div>
    <div className="editor-card ai-editor"><div className="editor-card-head"><span>02 / NARRATIVA & INTELIGÊNCIA ARTIFICIAL</span><span className="ai-chip">AI GATEWAY</span></div><div className="editor-card-body"><p className="ai-description">Você traz a essência. A NORTH encontra as palavras. Conte o que aconteceu no projeto e gere um texto criativo para o portfólio.</p><div className="admin-field"><label>DETALHES DO PROJETO *</label><textarea rows={4} value={form.brief} onChange={e=>change('brief',e.target.value)} placeholder="O que foi gravado? Onde? Qual a história, a proposta e os elementos importantes?"/></div><div className="admin-field"><label>OBJETIVO DO VÍDEO</label><input value={form.objective} onChange={e=>change('objective',e.target.value)} placeholder="Ex.: Apresentar a nova identidade da marca"/></div><div className="admin-field"><label>CLIMA / LINGUAGEM</label><input value={form.tone} onChange={e=>change('tone',e.target.value)} placeholder="Ex.: Cinematográfico, emocional, minimalista"/></div><button type="button" className="ai-generate" disabled={generating||!form.title||!form.brief} onClick={generate}><span>{generating?'GERANDO SUA DESCRIÇÃO...':'GERAR DESCRIÇÃO COM IA'}</span><span>↗</span></button><div className="admin-field"><label>DESCRIÇÃO FINAL <span className="field-help">EDITÁVEL</span></label><textarea rows={6} value={form.description} onChange={e=>change('description',e.target.value)} placeholder="A descrição criada pela IA aparece aqui. Você também pode escrever a sua."/></div></div></div></div>
    <div className="editor-side"><div className="editor-card"><div className="editor-card-head"><span>03 / MÍDIA</span><span>↗</span></div><div className="editor-card-body"><div className="admin-field"><label>LINK DO VÍDEO</label><input type="url" value={form.video_url} onChange={e=>change('video_url',e.target.value)} placeholder="YouTube, Vimeo ou MP4"/><small>Para exibição ideal, use vídeo vertical 9:16 (1080 × 1920). Você pode adicionar o link depois.</small></div><label className={`upload-box ${uploading==='video'?'busy':''}`}> <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>upload(e.target.files?.[0],'video')} disabled={Boolean(uploading)}/><span>↑</span><strong>{uploading==='video'?'ENVIANDO VÍDEO...':'OU ENVIAR ARQUIVO'}</strong><small>MP4, WEBM ou MOV · até 50 MB</small></label><div className="admin-field"><label>LINK DA CAPA</label><input value={form.cover_url} onChange={e=>change('cover_url',e.target.value)} placeholder="https://.../capa.jpg"/></div><label className={`upload-box compact ${uploading==='cover'?'busy':''}`}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>upload(e.target.files?.[0],'cover')} disabled={Boolean(uploading)}/><span>＋</span><strong>{uploading==='cover'?'ENVIANDO CAPA...':'ADICIONAR CAPA'}</strong><small>CAPA VERTICAL 9:16 · JPG, PNG ou WEBP · até 10 MB</small></label>{form.cover_url&&<div className="cover-preview" style={{backgroundImage:`url("${form.cover_url.replace(/"/g,'%22')}")`}}/>}</div></div><div className="editor-card"><div className="editor-card-head"><span>04 / PUBLICAÇÃO</span><span>●</span></div><div className="editor-card-body"><label className="admin-check"><input type="checkbox" checked={form.published} onChange={e=>change('published',e.target.checked)}/><span><strong>PUBLICAR NO SITE</strong><small>O projeto ficará visível para visitantes.</small></span></label><label className="admin-check"><input type="checkbox" checked={form.featured} onChange={e=>change('featured',e.target.checked)}/><span><strong>PROJETO EM DESTAQUE</strong><small>Marcar como trabalho especial.</small></span></label></div></div><button className="admin-save" type="submit" disabled={saving}>{saving?'SALVANDO...':editing?'SALVAR ALTERAÇÕES':'PUBLICAR PROJETO'} <span>↗</span></button><button className="admin-cancel" type="button" onClick={()=>setTab('projects')}>VOLTAR À LISTA</button></div></form>}
    </div></section></main>;
}
