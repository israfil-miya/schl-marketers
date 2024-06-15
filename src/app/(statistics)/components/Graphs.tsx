'use client';

import React, { useState, useEffect } from 'react';
import ReportsCountGraph from './ReportsCountGraph';
import ClientConversionRatesGraph from './ClientConversionRatesGraph';
import fetchData from '@/utility/fetchdata';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import TestParticipationRatesGraph from './TestParticipationRatesGraph';
const Graphs = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState({
    reportsCountByMonth: false,
    clientConversionRates: false,
    testParticipationRates: false,
  });

  const [reportsCountByMonth, setReportsCountByMonth] = useState({});
  const [clientConversionRates, setClientConversionRates] = useState({});
  const [testParticipationRates, setTestParticipationRates] = useState({});

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

  async function getClientConversionRates() {
    try {
      setIsLoading((prevData) => ({
        ...prevData,
        clientConversionRates: true,
      }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-client-conversion-rates';
      let options: {} = {
        method: 'GET',
        headers: {
          name: session?.user?.real_name,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setClientConversionRates(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving client conversion rates');
    } finally {
      setIsLoading((prevData) => ({
        ...prevData,
        clientConversionRates: false,
      }));
    }
  }

  async function getTestParticipationRates() {
    try {
      setIsLoading((prevData) => ({
        ...prevData,
        testParticipationRates: true,
      }));

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL +
        '/api/report?action=get-test-participation-rates';
      let options: {} = {
        method: 'GET',
        headers: {
          name: session?.user?.real_name,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setTestParticipationRates(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        'An error occurred while retrieving test participation rates',
      );
    } finally {
      setIsLoading((prevData) => ({
        ...prevData,
        testParticipationRates: false,
      }));
    }
  }

  useEffect(() => {
    getReportsCountByMonth();
    getClientConversionRates();
    getTestParticipationRates();
  }, []);

  return (
    <div>
      <ReportsCountGraph
        isLoading={isLoading.reportsCountByMonth}
        data={reportsCountByMonth}
      />
      <ClientConversionRatesGraph
        isLoading={isLoading.clientConversionRates}
        data={clientConversionRates}
      />
      <TestParticipationRatesGraph
        isLoading={isLoading.testParticipationRates}
        data={testParticipationRates}
      />
    </div>
  );
};

export default Graphs;
