import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';

import { AuthProvider } from '@/components/auth/auth-provider';
import { TRPCProvider } from '@/components/trpc-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'みつまるケア | 介護業務効率化プラットフォーム',
  description:
    '介護施設のシフト管理・勤怠・利用者情報共有までを一元化するクラウドサービスです。施設運営者・スタッフ・利用者の連携を円滑にし、業務効率を高めます。',
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <TRPCProvider>{children}</TRPCProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
