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
          <div className="flex flex-row justify-between">
            <div className="flex flex-row">
              <Image
                className="h-[8rem] w-[8rem] rounded-full border object-cover cursor-pointer"
                priority={false}
                src={`https://i2.wp.com/ui-avatars.com/api/${employeeInfo.real_name}/256/${color.current.backgroundColor}/${color.current.textColor}`}
                width={100}
                height={100}
                alt="avatar"
              />
              <div className="mt-4 ml-8">
                <h1 className="text-3xl font-extrabold">
                  {employeeInfo.real_name}{' '}
                  <span className="text-sm">({employeeInfo.e_id})</span>
                </h1>
                <h2 className="text-xl text-gray-600">
                  {employeeInfo.designation}
                </h2>
                <Link
                  className="text-lg inline-block hover:cursor-pointer hover:underline hover:opacity-100 text-blue-700"
                  target="_blank"
                  href="/my-account/change-password"
                >
                  Change your password
                </Link>
              </div>
            </div>
            <div className="mt-4">
              <h1 className="text-2xl font-extrabold">
                {employeeInfo.company_provided_name}
              </h1>
              <h2 className="text-lg  lowercase">{employeeInfo.email}</h2>
            </div>
          </div>
          <div className="flex flex-row flex-wrap justify-between mt-8">
            <div>
              <h3 className="text-xl font-semibold underline underline-offset-4">
                Joining Date
              </h3>
              <p className="text-lg">
                {employeeInfo?.joining_date
                  ? moment(
                      convertToDDMMYYYY(employeeInfo?.joining_date),
                      'DD-MM-YYYY',
                    ).format('D MMMM, YYYY')
                  : null}
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold underline underline-offset-4">
                Department
              </h3>
              <p className="text-lg">{employeeInfo.department}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold underline underline-offset-4">
                Phone
              </h3>
              <p className="text-lg">{employeeInfo.phone}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold underline underline-offset-4">
                Blood Group
              </h3>
              <p className="text-lg">{employeeInfo.blood_group}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold underline underline-offset-4">
                Status
              </h3>
              <p className="text-lg">{employeeInfo.status}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Overview;
