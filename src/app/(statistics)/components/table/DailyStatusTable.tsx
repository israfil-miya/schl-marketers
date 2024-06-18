'use client';
import React, { useState, useEffect } from 'react';
import fetchData from '@/utility/fetchdata';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface ReportsStatusState {
  totalCalls: number;
  totalTests: number;
  totalLeads: number;
  totalProspects: number;
}

const DailyStatusTable = () => {
  const [reportsStatus, setReportsStatus] = useState<ReportsStatusState>({
    totalCalls: 0,
    totalTests: 0,
    totalLeads: 0,
    totalProspects: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { data: session } = useSession();

  const [callsTarget, setCallsTarget] = useState<number>(55);
  const [leadsTarget, setLeadsTarget] = useState<number>(20);

  async function getReportsStatus() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-daily-reports-status';
      let options: {} = {
        method: 'GET',
        headers: {
          name: session?.user.real_name,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setReportsStatus(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving daily reports status');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getReportsStatus();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="font-mono text-destructive font-extrabold text-2xl text-center uppercase">
        <span className="underline">DAILY TARGET:</span> 55 CALLS (30 NORMAL, 25
        RECALL), 20 LEADS, 10 TESTS/MONTH
      </h2>
      <div className="table-responsive text-center text-nowrap text-lg px-2 mt-1">
        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Calls</th>
              <th>Tests</th>
              <th>Prospects</th>
              <th>Leads</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading ? (
              <tr>
                <td
                  className={
                    reportsStatus.totalCalls < callsTarget
                      ? 'text-destructive'
                      : 'text-green-400'
                  }
                >
                  {reportsStatus.totalCalls}
                  {reportsStatus.totalCalls < callsTarget &&
                    ` (${callsTarget - reportsStatus.totalCalls})`}
                </td>
                <td>{reportsStatus.totalTests}</td>
                <td>{reportsStatus.totalProspects}</td>
                <td
                  className={
                    reportsStatus.totalLeads < leadsTarget
                      ? 'text-destructive'
                      : 'text-green-400'
                  }
                >
                  {reportsStatus.totalLeads}
                  {reportsStatus.totalLeads < leadsTarget &&
                    ` (${leadsTarget - reportsStatus.totalLeads})`}
                </td>
              </tr>
            ) : (
              <tr key={0}>
                <td colSpan={4} className="align-center text-center">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyStatusTable;
