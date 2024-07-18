'use client';
import React, { useState, useEffect } from 'react';
import HiddenText from '@/components/HiddenText';
import {
  calculateSalaryComponents,
  getPFMoneyAmount,
  SalaryStructureType,
} from '@/utility/accountmatricshelpers';

interface OverviewProps {
  employeeInfo: any;
  isLoading: boolean;
}

const Overview: React.FC<OverviewProps> = (props) => {
  let { employeeInfo, isLoading } = props;

  const [salaryStructure, setSalaryStructure] = useState<SalaryStructureType>({
    base: 0,
    houseRent: 0,
    convAllowance: 0,
    grossSalary: 0,
  });

  const [pfAmount, setPfAmount] = useState<number>(0);

  useEffect(() => {
    if (!isLoading && employeeInfo?._id) {
      setSalaryStructure(calculateSalaryComponents(employeeInfo.gross_salary));
    }
  }, [employeeInfo.gross_salary]);

  useEffect(() => {
    if (!isLoading && employeeInfo?._id) {
      setPfAmount(getPFMoneyAmount(salaryStructure, employeeInfo));
    }
  }, [salaryStructure.base]);

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
              <p className="text-nowrap pl-4 underline">
                <HiddenText>
                  {salaryStructure.base?.toLocaleString('en-US')} BDT
                </HiddenText>
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">House Rent</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4 underline">
                <HiddenText>
                  {salaryStructure.houseRent?.toLocaleString('en-US')} BDT
                </HiddenText>
              </p>
            </div>
            <div className="flex flex-row items-center">
              <p className="text-nowrap pr-4 font-semibold">Conv. Allowance</p>
              <div className="border-[1px] border-dashed border-gray-300 w-full h-0 "></div>
              <p className="text-nowrap pl-4 underline">
                <HiddenText>
                  {salaryStructure.convAllowance?.toLocaleString('en-US')} BDT
                </HiddenText>
              </p>
            </div>
            <div className="flex flex-row items-center justify-end">
              <p className="text-nowrap pr-1 font-semibold">Gross: </p>
              <p className="text-nowrap underline">
                <HiddenText>
                  {salaryStructure.grossSalary?.toLocaleString('en-US')}
                  <span>
                    {' '}
                    BDT<span className="lowercase">{'/month'}</span>
                  </span>
                </HiddenText>
              </p>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-base">
              Over Time (OT):{' '}
              <span className="underline">
                {Math.round(salaryStructure.base / 30 / 8)?.toLocaleString(
                  'en-US',
                )}
                <span>
                  {' '}
                  BDT<span className="lowercase">{'/hour'}</span>
                </span>
              </span>
            </p>
            <div className="text-base">
              Provident Fund (PF):{' '}
              <p className="ml-12">
                Your's Part:
                <span className="underline">
                  {employeeInfo?.pf_start_date
                    ? employeeInfo.provident_fund
                      ? pfAmount.toLocaleString('en-US') + ' BDT'
                      : 'N/A'
                    : 'N/A'}
                </span>
              </p>
              <p className="ml-12">
                Company's Part:
                <span className="underline">
                  {employeeInfo?.pf_start_date
                    ? employeeInfo.provident_fund
                      ? pfAmount.toLocaleString('en-US') + ' BDT'
                      : 'N/A'
                    : 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Overview;
