import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Loading from '@/components/Loading';

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen no-scroll">
      <Header/>
      <main className="flex-1 overflow-auto pt-[76px]">
        <Suspense fallback={<Loading />}>
            {children}
        </Suspense>
      </main>
    </div>
  );
}