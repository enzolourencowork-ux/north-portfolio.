'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function Login() {
  const router = useRouter();
  const [email,setEmail] = useState(''); const [password,setPassword] = useState('');
  const [error,setError] = useState(''); const [loading,setLoading] = useState(false);
  async function login(e) {
    e.preventDefault(); setLoading(true); setError('');
    try { const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}); const j=await r.json(); if(!r.ok) throw new Error(j.error || 'Falha no login.'); router.replace('/admin'); router.refresh(); }
    catch(e){setError(e.message);} finally {setLoading(false);}
  }
  return <main className="login-page"><div className="login-graphic"><a href="/" className="login-back">← VOLTAR AO SITE</a><img className="login-giant-mark" src="/brand/north-mark-light.png" alt=""/><div><span>PAINEL DE CONTROLE / NORTH</span><h1>A DIREÇÃO<br/>COMEÇA<br/><em>AQUI.</em></h1></div><span className="login-corner">ACESSO PRIVADO • 001</span></div><div className="login-form-panel"><div className="login-form-wrap"><img src="/brand/north-wordmark-dark.png" alt="NORTH Produtora Audiovisual"/><div className="login-kicker"><span className="green-square"/> ÁREA EXCLUSIVA</div><h2>Bem-vindo<br/>de volta<span>.</span></h2><p>Entre para gerenciar seu portfólio e criar descrições com inteligência artificial.</p><form onSubmit={login}><label>E-MAIL DO ADMINISTRADOR<input type="email" autoComplete="username" required placeholder="seu@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>SENHA<input type="password" autoComplete="current-password" required placeholder="••••••••••••" value={password} onChange={e=>setPassword(e.target.value)}/></label>{error && <div className="form-error" role="alert">{error}</div>}<button type="submit" disabled={loading}>{loading?'VERIFICANDO...':'ENTRAR NO PAINEL'} <span>↗</span></button></form><span className="login-footnote">ACESSO PROTEGIDO. APENAS O PROPRIETÁRIO.</span></div></div></main>;
}
