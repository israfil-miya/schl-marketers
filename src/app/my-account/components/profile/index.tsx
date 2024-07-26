'use client';

import React, { useEffect } from 'react';
import Overview from './Overview';
import { useSession } from 'next-auth/react';
import fetchData from '@/utility/fetchdata';
import { toast } from 'sonner';
import SalaryStructure from './SalaryStructure';

interface ProfilePropsTypes {
  avatarURI: string;
}

const Profile: React.FC<ProfilePropsTypes> = (props) => {
  const { data: session } = useSession();
  const [employeeInfo, setEmployeeInfo] = React.useState<{
    [key: string]: string | number;
  }>({});
  const [isLoading, setIsLoading] = React.useState<{
    overview: boolean;
    salaryStructure: boolean;
  }>({ overview: false, salaryStructure: false });

  async function getEmployeeInfo() {
    try {
      setIsLoading({ ...isLoading, overview: true, salaryStructure: true });

      let url: string = process.env.NEXT_PUBLIC_PORTAL_URL + '/api/employee';
      let options: {} = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          getmarkernamebyrealname: true,
          real_name: session?.user.real_name,
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setEmployeeInfo(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving employee data');
    } finally {
      setIsLoading({ ...isLoading, overview: false, salaryStructure: false });
    }
  }

  useEffect(() => {
    getEmployeeInfo();
  }, []);

  return (
    <div className="flex flex-col gap-4 font-mono">
      <Overview
        isLoading={isLoading.overview}
        employeeInfo={employeeInfo}
        avatarURI={props.avatarURI}
      />
      <SalaryStructure
        isLoading={isLoading.salaryStructure}
        employeeInfo={employeeInfo}
      />
    </div>
  );
};

export default Profile;
