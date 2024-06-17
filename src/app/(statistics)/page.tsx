import Header from '@/components/Header';
import React from 'react';
import Graphs from './components/graph/Graphs';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Cards from './components/card/Cards';

const Statistics = async () => {
  const session = await auth();
  return (
    <>
      <Header />
      <Cards />
      <SessionProvider session={session}>
        <Graphs />
      </SessionProvider>
    </>
  );
};

export default Statistics;
