'use client';

import React, { useState, useEffect } from 'react';
import ReportsCountGraph from './ReportsCountGraph';
import fetchData from '@/utility/fetchdata';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
const Graphs = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState({ reportsCountByMonth: false });

  const [reportsCountByMonth, setReportsCountByMonth] = useState({});

  async function getReportsCountByMonth() {
    try {
      setIsLoading((prevData) => ({ ...prevData, reportsCountByMonth: true }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-reports-count';
      let options: {} = {
        method: 'GET',
        headers: {
          name: session?.user?.real_name,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setReportsCountByMonth(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving reports count data');
    } finally {
      setIsLoading((prevData) => ({ ...prevData, reportsCountByMonth: false }));
    }
  }

  useEffect(() => {
    getReportsCountByMonth();
  }, []);

  return (
    <div>
      <ReportsCountGraph
        isLoading={isLoading.reportsCountByMonth}
        data={reportsCountByMonth}
      />
    </div>
  );
};

export default Graphs;
