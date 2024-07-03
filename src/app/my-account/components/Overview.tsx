'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import getRandomColor from '@/utility/randomcolorgenerator';
import { useSession } from 'next-auth/react';

const Overview = () => {
  const { data: session } = useSession();
  let color = useRef(getRandomColor());

  return (
    <div className="mb-4 px-10 py-2 bg-gray-100 border-2">
      <Image
        className="h-40 w-40 rounded-full border object-cover"
        priority={false}
        src={`https://i2.wp.com/ui-avatars.com/api/${session?.user.real_name}/256/${color.current.backgroundColor}/${color.current.textColor}`}
        width={100}
        height={100}
        alt="avatar"
      />
    </div>
  );
};

export default Overview;
