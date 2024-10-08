import Header from '@/components/Header';
import React from 'react';
import InputForm from '../components/changepassword/Form';
import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

const ChangePasswordPage = async () => {
  const session = await auth();

  return (
    <>
      <Header />
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <h1 className="text-2xl font-semibold text-left mb-4 underline underline-offset-4 uppercase">
          Change password
        </h1>
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <SessionProvider session={session}>
            <InputForm />
          </SessionProvider>
        </Suspense>
      </div>
    </>
  );
};

export default ChangePasswordPage;
