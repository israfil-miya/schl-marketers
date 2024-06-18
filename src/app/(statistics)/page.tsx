import Header from '@/components/Header';
import React from 'react';
import Graphs from './components/graph/Graphs';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Cards from './components/card/Cards';
import DailyStatusTable from './components/table/DailyStatusTable';

const Statistics = async () => {
  const session = await auth();
  return (
    <>
      <Header />
      <SessionProvider session={session}>
        <DailyStatusTable />
        <Cards />
        <Graphs />
      </SessionProvider>
    </>
  );
};

export default Statistics;
