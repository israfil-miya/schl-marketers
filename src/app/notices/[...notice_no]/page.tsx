import React from 'react';
import Header from '@/components/Header';
import ViewNotice from '../components/Notice/View';

const NoticeView = ({ params }: { params: { notice_no: string } }) => {
  const { notice_no } = params;

  return (
    <>
      <Header />
      <div className="px-4 mt-8 mb-4">
        <ViewNotice notice_no={notice_no} />
      </div>
    </>
  );
};

export default NoticeView;
