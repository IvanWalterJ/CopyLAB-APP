'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AppProvider } from '@/lib/context';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <AppProvider>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden w-full h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </AppProvider>
  );
}
