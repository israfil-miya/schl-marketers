'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import getRandomColor from '@/utility/randomcolorgenerator';
import Link from 'next/link';
import { YYYY_MM_DD_to_DD_MM_YY as convertToDDMMYYYY } from '@/utility/dateconvertion';
import moment from 'moment-timezone';

interface OverviewProps {
  employeeInfo: any;
  isLoading: boolean;
}

const Overview: React.FC<OverviewProps> = (props) => {
  let { employeeInfo, isLoading } = props;

  console.log(props.employeeInfo, props.isLoading);

  return (
    <>
      {isLoading || !employeeInfo._id ? (
        <p className="text-center px-10 py-2 bg-gray-100 border-2">
          Loading...
        </p>
      ) : null}
      {!isLoading && employeeInfo?._id && (
        <div className="px-10 py-6 bg-gray-100 border-2">
          <h1 className="text-center underline underline-offset-4 text-2xl font-semibold mb-2">
            Salary Structure
          </h1>

          <div className="flex flex-col">
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">Basic</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4  underline">{'0 BDT'}</p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">House Rent</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4 font-extralight  underline">
                {'0 BDT'}
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">Conv. Allowance</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4  underline">{'0 BDT'}</p>
            </div>
            <div className="flex flex-row items-center justify-end">
              <p className="text-nowrap pr-1 font-semibold">Gross: </p>
              <p className="text-nowrap underline">
                {'0 BDT'}
                <span className="lowercase">{'/month'}</span>
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-base">
              Over Time (OT):{' '}
              <span className="underline">
                0 BDT<span className="lowercase">{'/hour'}</span>
              </span>
            </p>
            <p className="text-base">
              Provident Fund (PF): <span className="underline">{'0 BDT'}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Overview;
