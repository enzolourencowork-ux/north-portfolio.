# NORTH — Portfólio Audiovisual

**Siga para o Norte.** Site e painel privado para a produtora NORTH, com a identidade enviada pelo proprietário.

## O que está pronto

- Site público responsivo, com manifesto, filtros por categoria, projetos, player YouTube/Vimeo/MP4 **vertical 9:16**, capas verticais e contato.
- Logos **extraídas da imagem original fornecida**, com transparência e versões claras/escuras. Não foram substituídas por fontes genéricas.
- Login privado com senha criptografada via `scrypt`, cookie HTTP-only assinado, expiração e proteção de origem.
- Painel para adicionar, editar, publicar, ocultar e excluir projetos, capas e vídeos.
- Upload de imagens até **10 MB** e vídeos até **50 MB** via URLs assinadas do Supabase Storage; para vídeos maiores, cole um link YouTube, Vimeo ou MP4 hospedado.
- Gerador de descrições criativas usando **Vercel AI Gateway**. A chave nunca é exposta ao navegador e o endpoint só atende ao administrador autenticado.
- Projetos conceituais de exemplo para mostrar o visual **antes de configurar o banco**. São demonstrações, não trabalhos reais da NORTH.

## 1. Instalação

Requer Node.js 20+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3000. O site público funciona com os projetos demonstrativos mesmo sem serviços externos.

## 2. Ativar o login do proprietário

No terminal, execute:

```bash
npm run password:hash
openssl rand -hex 32
```

Copie o hash da senha e o segredo gerado para `.env.local`, junto com seu e-mail:

```env
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD_HASH=<hash gerado>
SESSION_SECRET=<segredo aleatório de 64 caracteres hex>
```

Abra `/admin/login`. **Não compartilhe a senha nem envie `.env.local` para repositórios públicos.**

## 3. Salvar projetos e enviar arquivos

1. Crie um projeto Supabase (pode ter custos conforme o plano e o uso).
2. No SQL Editor, execute `supabase/schema.sql`. Ele cria a tabela e o bucket público de mídia, com RLS habilitado e sem acesso direto para chaves públicas.
3. Em Supabase > Project Settings > API, copie URL, anon key e service role key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave anon>
SUPABASE_SERVICE_ROLE_KEY=<chave service_role>
```

**Segurança:** `SUPABASE_SERVICE_ROLE_KEY` só deve existir no servidor. Não a coloque em variáveis `NEXT_PUBLIC_`.

Após configurar, o site passa a exibir os projetos publicados da sua base. O painel permite cadastrar e editar projetos, colar links de vídeo e fazer upload de mídia.

## 4. Gerar descrições com AI Gateway

1. Em [Vercel AI Gateway](https://vercel.com/ai-gateway), crie uma API key e confira créditos e modelo disponível.
2. Configure no `.env.local` e nas variáveis de ambiente do seu deploy:

```env
AI_GATEWAY_API_KEY=<chave privada do gateway>
AI_GATEWAY_MODEL=openai/gpt-5.4-mini
```

No painel, abra **Novo projeto**, informe nome e detalhes, clique **Gerar descrição com IA**, revise e salve. O endpoint `/api/generate` é inacessível sem login. Cada geração pode ter custo conforme o modelo.

## 5. Ativar o contato

Configure o link de destino do botão final, por exemplo o seu WhatsApp ou Instagram:

```env
NEXT_PUBLIC_CONTACT_URL=https://wa.me/55SEUNUMERO
```

Sem esse link, o botão mostra “Contato em breve”, sem inventar um telefone.

## 6. Publicar na Vercel

1. Envie esta pasta para um repositório Git e importe-o em [vercel.com/new](https://vercel.com/new).
2. Configure as variáveis de ambiente de `.env.example` no projeto Vercel (valores secretos nunca no Git).
3. Faça o deploy. Verifique `/admin/login`, publicação de projeto, upload e geração de texto.

## Identidade

- **#141716** — preto esverdeado
- **#F3F0E8** — off-white
- **#C7F464** — verde-lima
- **Bordão:** SIGA PARA O NORTE.

As imagens de logo foram **recortadas e tratadas a partir da prancha enviada**, preservando os traços originais. Para máxima nitidez em tamanhos muito grandes, substitua pelos arquivos vetoriais oficiais caso os tenha.

## Estrutura

- `app/` — páginas e rotas protegidas.
- `components/Portfolio.jsx` — site público.
- `components/Dashboard.jsx` — painel privado, upload e IA.
- `public/brand/` — logos extraídas da referência.
- `public/media/` — materiais conceituais de demonstração.
- `supabase/schema.sql` — tabela e bucket.

**Nota:** sem as credenciais externas, o login, o banco e a IA ficam intencionalmente inativos. Isso evita simular segurança ou fingir que uma geração real ocorreu.

## Refinamento visual v2 — 06/11/2026

- Faixa animada redesenhada em preto com tipografia editorial, texto vazado verde-lima e divisores geométricos. Nenhum emoji ou ícone de sistema.
- Botão circular do hero removido; no lugar, um link tipográfico com fio gráfico discreto.
- Cards do portfólio com proporção fixa **9:16**, grade de 4/3/2 colunas conforme a largura da tela.
- Visualização dos vídeos em **9:16** com painel descritivo ao lado no desktop e abaixo no celular. Arquivos horizontais não são esticados: são apresentados com contenção dentro do player vertical.
- Painel administrativo orienta enviar capas e vídeos verticais **1080 × 1920**.
- `prefers-reduced-motion` é respeitado para quem prefere animação reduzida.
