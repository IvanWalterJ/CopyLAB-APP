'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { AppProvider } from '@/lib/context';

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isOnboarding = pathname.startsWith('/onboarding');

  if (isAuthPage) {
    return <div className="flex-1 h-screen overflow-auto">{children}</div>;
  }

  if (isOnboarding) {
    return (
      <AppProvider>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </AppProvider>
    );
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
