'use client';

import React, { useEffect } from 'react';
import Overview from './Overview';
import { useSession } from 'next-auth/react';
import fetchData from '@/utility/fetchdata';
import { toast } from 'sonner';

const Profile: React.FC = () => {
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
      setIsLoading({ ...isLoading, overview: true });

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
      setIsLoading({ ...isLoading, overview: false });
    }
  }

  useEffect(() => {
    getEmployeeInfo();
  }, []);

  return (
    <div>
      <Overview isLoading={isLoading.overview} employeeInfo={employeeInfo} />
    </div>
  );
};

export default Profile;
