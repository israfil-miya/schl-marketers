'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import getRandomColor from '@/utility/randomcolorgenerator';

interface OverviewProps {
  employeeInfo: any;
  isLoading: boolean;
}

const Overview: React.FC<OverviewProps> = (props) => {
  let color = useRef(getRandomColor());

  let { employeeInfo, isLoading } = props;

  console.log(props.employeeInfo, props.isLoading);

  return (
    <div className="mb-4 px-10 py-2 bg-gray-100 border-2 flex">
      <Image
        className="h-40 w-40 rounded-full border object-cover"
        priority={false}
        src={`https://i2.wp.com/ui-avatars.com/api/${employeeInfo.real_name}/256/${color.current.backgroundColor}/${color.current.textColor}`}
        width={100}
        height={100}
        alt="avatar"
      />
      <div className="flex flex-row mt-4 ml-4">
        <h1 className="text-3xl">
          {employeeInfo.real_name}{' '}
          <span className="text-sm align-bottom">({employeeInfo.e_id})</span>
        </h1>
      </div>
    </div>
  );
};

export default Overview;
