import Header from '@/components/Header';
import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import Profile from './components/profile';
import crypto from 'node:crypto';

async function sha256(message: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

const MyAccountPage = async () => {
  const session = await auth();

  const avatarURI =
    'https://gravatar.com/avatar/' +
    (await sha256(
      session?.user.real_name.trim().toLowerCase() || 'johndoe@pos.com',
    )) +
    '/?s=400&d=identicon&r=x';

  return (
    <>
      <Header />
      <div className="px-4 mt-8 mb-4 flex flex-col justify-center md:w-[70vw] mx-auto">
        <SessionProvider session={session}>
          <Profile avatarURI={avatarURI} />
        </SessionProvider>
      </div>
    </>
  );
};

export default MyAccountPage;
