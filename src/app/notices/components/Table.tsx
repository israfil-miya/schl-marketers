'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FilterButton from './Filter';
import { toast } from 'sonner';
import fetchData from '@/utility/fetchdata';
import { ISO_to_DD_MM_YY as convertToDDMMYYYY } from '@/utility/dateconvertion';
import moment from 'moment-timezone';

type NoticesState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: { [key: string]: any }[];
};

const Table = () => {
  const [notices, setNotices] = useState<NoticesState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
  });

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    noticeNo: '',
    title: '',
  });

  async function getAllNotices() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=get-all-notices';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ channel: 'marketers' }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setNotices(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving notices data');
    } finally {
      setIsLoading(false);
    }
  }

  async function getAllNoticesFiltered() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/notice?action=get-all-notices';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: true,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...filters, channel: 'marketers' }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setNotices(response.data);
        setIsFiltered(true);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving notices data');
    } finally {
      setIsLoading(false);
    }
    return;
  }

  useEffect(() => {
    getAllNotices();
  }, []);

  function handlePrevious() {
    setPage((p) => {
      if (p === 1) return p;
      return p - 1;
    });
  }

  function handleNext() {
    setPage((p) => {
      if (p === pageCount) return p;
      return p + 1;
    });
  }

  useEffect(() => {
    if (prevPage.current !== 1 || page > 1) {
      if (notices?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllNotices();
      else getAllNoticesFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (notices?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllNoticesFiltered();
      }
      if (notices) setPageCount(notices?.pagination?.pageCount);
      prevPageCount.current = notices?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [notices?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllNotices();
    else getAllNoticesFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col justify-center sm:flex-row sm:justify-end mb-4 gap-2">
        <div className="items-center flex gap-2">
          <div className="inline-flex rounded-md" role="group">
            <button
              onClick={handlePrevious}
              disabled={page === 1 || pageCount === 0 || isLoading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-200 text-gray-700 border border-gray-200 rounded-s-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5"
                />
              </svg>
              Prev
            </button>
            <button
              disabled={true}
              className="hidden sm:visible sm:inline-flex items-center px-4 py-2 text-sm font-medium border"
            >
              <label>
                Page <b>{notices?.items?.length !== 0 ? page : 0}</b> of{' '}
                <b>{pageCount}</b>
              </label>
            </button>
            <button
              onClick={handleNext}
              disabled={page === pageCount || pageCount === 0 || isLoading}
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm bg-gray-200 text-gray-700 border border-gray-200 rounded-e-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
                />
              </svg>
            </button>
          </div>

          <select
            value={itemPerPage}
            onChange={(e) => setItemPerPage(parseInt(e.target.value))}
            defaultValue={30}
            required
            className="appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <FilterButton
            isLoading={isLoading}
            submitHandler={getAllNoticesFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {isLoading ? <p className="text-center">Loading...</p> : <></>}

      {!isLoading &&
        (notices?.items?.length !== 0 ? (
          <div className="table-responsive text-nowrap text-sm">
            <table className="table table-bordered table-striped">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Notice No</th>
                  <th>Title</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {notices?.items?.map((item, index) => {
                  return (
                    <tr key={item.notice_no}>
                      <td>{index + 1 + itemPerPage * (page - 1)}</td>
                      <td>
                        {item.updatedAt
                          ? moment(
                              convertToDDMMYYYY(item.updatedAt),
                              'DD-MM-YYYY',
                            ).format('D MMMM, YYYY')
                          : null}
                      </td>
                      <td>{item.notice_no}</td>
                      <td>{item.title}</td>
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          <button
                            onClick={() => {
                              router.push(
                                process.env.NEXT_PUBLIC_BASE_URL +
                                  `/notices/${item.notice_no}`,
                              );
                            }}
                            className="items-center gap-2 rounded-md bg-blue-600 hover:opacity-90 hover:ring-2 hover:ring-blue-600 transition duration-200 delay-300 hover:text-opacity-100 text-white p-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                              />
                              <path
                                fill-rule="evenodd"
                                d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <tr key={0}>
            <td colSpan={5} className=" align-center text-center">
              No Notices To Show.
            </td>
          </tr>
        ))}
      <style jsx>
        {`
          th,
          td {
            padding: 2.5px 10px;
          }
        `}
      </style>
    </>
  );
};

export default Table;
