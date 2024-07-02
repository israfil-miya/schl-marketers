import Header from '@/components/Header';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

const MyAccountPage = async () => {
  const session = await auth();
  return (
    <>
      <Header />
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <SessionProvider session={session}>Hi</SessionProvider>
      </div>
    </>
  );
};

export default MyAccountPage;