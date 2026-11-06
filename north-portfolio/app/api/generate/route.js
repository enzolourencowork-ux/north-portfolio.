import { NextResponse } from 'next/server';
import { getSession, validOrigin } from '../../../lib/auth';
export const runtime = 'nodejs';
export async function POST(request) {
  if (!await getSession()) return NextResponse.json({ error: 'Faça login para usar a IA.' }, { status: 401 });
  if (!validOrigin(request)) return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  if (!process.env.AI_GATEWAY_API_KEY) return NextResponse.json({ error: 'Configure AI_GATEWAY_API_KEY para ativar o gerador.' }, { status: 503 });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 }); }
  const fields = ['title','client','category','brief','objective','tone'];
  const p = Object.fromEntries(fields.map(k => [k, typeof body[k] === 'string' ? body[k].trim().slice(0, 1500) : '']));
  if (!p.title || !p.brief) return NextResponse.json({ error: 'Informe o nome e os detalhes do projeto.' }, { status: 400 });
  try {
    const result = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_GATEWAY_API_KEY}` },
      body: JSON.stringify({
        model: process.env.AI_GATEWAY_MODEL || 'openai/gpt-5.4-mini',
        max_completion_tokens: 650,
        messages: [
          { role: 'system', content: 'Você é diretor criativo e redator de portfólios de uma produtora audiovisual brasileira chamada NORTH. Bordão: "Siga para o Norte". Escreva uma descrição de portfólio em português brasileiro, em 55 a 90 palavras, com linguagem cinematográfica, original, precisa, contemporânea e humana. Valorize o desafio, a escolha criativa, o impacto e a atmosfera do projeto. Não invente resultados, números, prêmios, locações, equipe ou entregáveis não informados. Não use hashtags, emojis, título, bullet points, frases genéricas de IA, nem bordões forçados. Apenas um parágrafo final, pronto para publicação.' },
          { role: 'user', content: `Projeto: ${p.title}\nCliente: ${p.client || 'não informado'}\nCategoria: ${p.category || 'audiovisual'}\nDetalhes reais: ${p.brief}\nObjetivo: ${p.objective || 'não informado'}\nAtmosfera / tom: ${p.tone || 'autoral, cinematográfico e confiante'}` },
        ],
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000),
    });
    if (!result.ok) return NextResponse.json({ error: 'O AI Gateway não conseguiu gerar o texto. Confira modelo, chave e créditos.' }, { status: 502 });
    const json = await result.json();
    const description = json.choices?.[0]?.message?.content?.trim();
    if (!description) return NextResponse.json({ error: 'O modelo retornou uma resposta vazia.' }, { status: 502 });
    return NextResponse.json({ description });
  } catch { return NextResponse.json({ error: 'Falha temporária na conexão com a IA.' }, { status: 502 }); }
}
