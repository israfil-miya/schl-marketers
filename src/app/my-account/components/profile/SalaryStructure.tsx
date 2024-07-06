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
  let color = useRef(getRandomColor());

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
          <h1 className="text-center underline underline-offset-4 text-2xl font-semibold">
            Salary Structure
          </h1>

          <div>
            {/* <div>
              <h1>Basic</h1>
              <div className="border-2 border-dashed border-gray-600"></div>
              <h1>{'10,000 BDT'}</h1>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

export default Overview;
