'use client';

import { ISO_to_DD_MM_YY as convertToDDMMYYYY } from '@/utility/date';
import fetchData from '@/utility/fetch';
import moment from 'moment-timezone';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ViewNoticeProps {
  notice_no: string;
}

interface Notice {
  channel: string;
  notice_no: string;
  title: string;
  description: string;
  file_name: string;
  updatedAt: string;
  createdAt: string;
  [key: string]: any;
}

const ViewNotice: React.FC<ViewNoticeProps> = (props) => {
  const [notice, setNotice] = useState<Notice>({
    channel: '',
    notice_no: '',
    title: '',
    description: '',
    file_name: '',
    updatedAt: '',
    createdAt: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  let constructFileName = (file_name: string, notice_no: string): string => {
    let file_ext = file_name.split('.').pop();
    let file_name_without_ext = file_name.split('.').slice(0, -1).join('.');
    let new_file_name = `${file_name_without_ext}_${notice_no}.${file_ext}`;
    return new_file_name;
  };

  async function getNotice() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=get-notice';
      let options: {} = {
        method: 'GET',
        headers: {
          notice_no: props.notice_no,
          'Content-Type': 'application/json',
        },
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        if (response.data?.channel != 'marketers') {
          toast.error("The notice doesn't belong to this channel");
          router.push('/');
        }
        setNotice(response.data);
      } else {
        toast.error(response.data);
        router.push(process.env.NEXT_PUBLIC_BASE_URL + '/notices');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving the notice');
      router.push(process.env.NEXT_PUBLIC_BASE_URL + '/notices');
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileDownload = async () => {
    try {
      const url: string = process.env.NEXT_PUBLIC_PORTAL_URL + '/api/ftp';

      const options = {
        method: 'GET',
        headers: {
          downloadfile: true,
          filename: constructFileName(notice.file_name, notice.notice_no),
          folder_name: 'notice',
        },
      };

      const response = await fetchData(url, options);

      if (response.ok) {
        // Create a blob from the response and download it
        const blob = await response.data.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = notice.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error(response.data);
        toast.error('Error downloading the file');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while downloading the file');
    }
  };

  useEffect(() => {
    getNotice();
  }, [props.notice_no]);

  return (
    <>
      {isLoading ? <p className="text-center">Loading...</p> : <></>}
      {!isLoading && (
        <div className="notice container mt-5 mb-3">
          <div className="notice-header mb-4">
            <h2 className="mb-0 font-semibold text-3xl">{notice.title}</h2>
            <p className="text-md font-medium text-gray-600">
              {notice.createdAt
                ? moment(
                    convertToDDMMYYYY(notice?.createdAt),
                    'DD-MM-YYYY',
                  ).format('D MMMM, YYYY')
                : null}
            </p>
          </div>
          <div
            className="notice-body text-lg my-3"
            dangerouslySetInnerHTML={{ __html: notice.description }}
          />

          {notice.file_name && (
            <div className="file-download text-lg">
              <span className="font-semibold">Downloads: </span>{' '}
              <span
                onClick={handleFileDownload}
                className="underline font-mono downloadable-file hover:cursor-pointer has-tooltip"
              >
                {notice.file_name}
                <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                  Click to download
                </span>
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ViewNotice;
