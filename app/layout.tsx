import {Fraunces, Inter, JetBrains_Mono} from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id">
      <body className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
