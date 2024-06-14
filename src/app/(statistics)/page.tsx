import Header from '@/components/Header';
import React from 'react';
import Graphs from './components/Graphs';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

const Statistics = async () => {
  const session = await auth();
  return (
    <>
      <Header />
      <SessionProvider session={session}>
        <Graphs />
      </SessionProvider>
    </>
  );
};

export default Statistics;
