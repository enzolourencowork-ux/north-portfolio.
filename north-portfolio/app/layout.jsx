import './globals.css';

export const metadata = {
  title: 'NORTH — Produtora Audiovisual | Siga para o Norte',
  description: 'NORTH. Produtora audiovisual. Criamos imagens que deixam marcas, histórias que apontam para frente e narrativas com direção. Siga para o Norte.',
  openGraph: { title: 'NORTH — Siga para o Norte', description: 'Produtora audiovisual. Histórias com direção.', type: 'website', images: ['/og-cover.jpg'] },
};

export default function RootLayout({ children }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
