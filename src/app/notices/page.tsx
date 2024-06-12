import React from 'react';
import Header from '@/components/Header';
import Table from './components/Table';

const NoticesPage = async () => {
  return (
    <>
      <Header />
      <div className="px-4 mt-8 mb-4">
        <Table />
      </div>
    </>
  );
};

export default NoticesPage;
