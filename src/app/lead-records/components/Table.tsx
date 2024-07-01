'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FilterButton from './Filter';
import { toast } from 'sonner';
import fetchData from '@/utility/fetchdata';
import { YYYY_MM_DD_to_DD_MM_YY as convertToDDMMYYYY } from '@/utility/dateconvertion';
import CallingStatusTd from '@/components/ExtendableTd';
import Linkify from '@/components/Linkify';
import DeleteButton from './Delete';
import EditButton from './Edit';
import WithdrawLeadButton from './Withdraw';
import { useSession } from 'next-auth/react';

type LeadsState = {
  pagination: {
    count: number;
    pageCount: number;
  };
  items: { [key: string]: any }[];
};

const Table = () => {
  const [leads, setLeads] = useState<LeadsState>({
    pagination: {
      count: 0,
      pageCount: 0,
    },
    items: [],
  });

  const { data: session } = useSession();

  const router = useRouter();

  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number>(0);
  const [itemPerPage, setItemPerPage] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const prevPageCount = useRef<number>(0);
  const prevPage = useRef<number>(1);

  const [filters, setFilters] = useState({
    country: '',
    companyName: '',
    category: '',
    fromDate: '',
    toDate: '',
    test: false,
    prospect: false,
    generalSearchString: '',
    show: 'all' as 'all' | 'mine' | 'others',
  });

  async function getAllLeads() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: false,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          show: 'all',
          onlyLead: true,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setLeads(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving leads data');
    } finally {
      setIsLoading(false);
    }
  }

  async function getAllLeadsFiltered() {
    try {
      setIsLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=get-all-reports';
      let options: {} = {
        method: 'POST',
        headers: {
          filtered: true,
          paginated: true,
          item_per_page: itemPerPage,
          page,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...filters,
          onlyLead: true,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setLeads(response.data);
        setIsFiltered(true);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while retrieving leads data');
    } finally {
      setIsLoading(false);
    }
    return;
  }

  async function deleteLead(
    originalLeadData: { [key: string]: any },
    leadId: string,
    reqBy: string,
  ) {
    try {
      // block delete action if the lead is others and the user is not the one who created the lead
      if (originalLeadData.marketer_name !== reqBy) {
        toast.error('You are not allowed to delete this lead');
        return;
      }

      let url: string = process.env.NEXT_PUBLIC_PORTAL_URL + '/api/approval';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          req_type: 'Report Delete',
          req_by: reqBy,
          id: leadId,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        toast.success('Request sent for approval');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while sending request for approval');
    }
    return;
  }

  async function editLead(
    originalLeadData: { [key: string]: any },
    editedData: { [key: string]: any },
    setEditedData: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>,
  ) {
    try {
      if (!editedData.followup_done && editedData.followup_date === '') {
        toast.error(
          'Followup date is required because followup is set as pending for this lead',
        );
        setEditedData({
          ...originalLeadData,
          updated_by: session?.user?.real_name || '',
        });
        return;
      }

      // block edit action if the lead is others and the user is not the one who created the lead
      if (originalLeadData.marketer_name !== session?.user.real_name) {
        toast.error('You are not allowed to edit this lead');
        setEditedData({
          ...originalLeadData,
          updated_by: session?.user?.real_name || '',
        });
        return;
      }

      setIsLoading(true);

      const editReportUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/report?action=edit-report`;
      const editOptions = {
        method: 'POST',
        body: JSON.stringify(editedData),
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetchData(editReportUrl, editOptions);

      if (response.ok) {
        if (!isFiltered) await getAllLeads();
        else await getAllLeadsFiltered();

        toast.success('Edited the lead successfully');
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while editing the lead');
    } finally {
      setEditedData({
        ...originalLeadData,
        updated_by: session?.user?.real_name || '',
      });
      setIsLoading(false);
    }
  }

  async function withdrawLead(
    originalLeadData: { [key: string]: any },
    leadId: string,
    reqBy: string,
  ) {
    try {
      // block withdraw action if the lead is others and the user is not the one who created the lead
      if (originalLeadData.marketer_name !== reqBy) {
        toast.error('You are not allowed to withdraw this lead');
        return;
      }

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/report?action=withdraw-lead';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: leadId,
          req_by: reqBy,
        }),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        if (!isFiltered) await getAllLeads();
        else await getAllLeadsFiltered();

        toast.success('The lead has been withdrawn successfully');
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while withdrawing the lead');
    }
  }

  useEffect(() => {
    getAllLeads();
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
      if (leads?.pagination?.pageCount == 1) return;
      if (!isFiltered) getAllLeads();
      else getAllLeadsFiltered();
    }
    prevPage.current = page;
  }, [page]);

  useEffect(() => {
    if (leads?.pagination?.pageCount !== undefined) {
      setPage(1);
      if (prevPageCount.current !== 0) {
        if (!isFiltered) getAllLeadsFiltered();
      }
      if (leads) setPageCount(leads?.pagination?.pageCount);
      prevPageCount.current = leads?.pagination?.pageCount;
      prevPage.current = 1;
    }
  }, [leads?.pagination?.pageCount]);

  useEffect(() => {
    // Reset to first page when itemPerPage changes
    prevPageCount.current = 0;
    prevPage.current = 1;
    setPage(1);

    if (!isFiltered) getAllLeads();
    else getAllLeadsFiltered();
  }, [itemPerPage]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <button
          onClick={() =>
            router.push(
              process.env.NEXT_PUBLIC_BASE_URL +
                '/make-a-call' +
                '?new-lead=true',
            )
          }
          className="flex justify-between items-center gap-2 rounded-md bg-primary hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-white px-3 py-2"
        >
          Add new lead
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
          </svg>
        </button>

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
                Page <b>{leads?.items?.length !== 0 ? page : 0}</b> of{' '}
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
            // defaultValue={30}
            required
            className="appearance-none bg-gray-200 text-gray-700 border border-gray-200 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
          >
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <FilterButton
            isLoading={isLoading}
            submitHandler={getAllLeadsFiltered}
            setFilters={setFilters}
            filters={filters}
            className="w-full justify-between sm:w-auto"
          />
        </div>
      </div>

      {isLoading ? <p className="text-center">Loading...</p> : <></>}

      {!isLoading &&
        (leads?.items?.length !== 0 ? (
          <div className="table-responsive text-nowrap text-sm">
            <table className="table">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Calling Date</th>
                  <th>Followup Date</th>
                  <th>Country</th>
                  <th>Website</th>
                  <th>Category</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Designation</th>
                  <th>Contact Number</th>
                  <th>Email Address</th>
                  <th>Calling Status</th>
                  <th>LinkedIn</th>
                  <th>Test</th>
                  <th>Prospected</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {leads?.items?.map((item, index) => {
                  let tableRowColor = 'table-secondary';

                  if (item.is_prospected) {
                    if (item?.prospect_status == 'high_interest') {
                      tableRowColor = 'table-success';
                    } else if (item?.prospect_status == 'low_interest') {
                      tableRowColor = 'table-warning';
                    }
                  } else {
                    tableRowColor = 'table-danger';
                  }

                  return (
                    <tr
                      key={item._id}
                      className={tableRowColor ? tableRowColor : ''}
                    >
                      <td>{index + 1 + itemPerPage * (page - 1)}</td>
                      <td>
                        {item.calling_date
                          ? convertToDDMMYYYY(item.calling_date)
                          : null}
                      </td>
                      <td>
                        {item.followup_date
                          ? convertToDDMMYYYY(item.followup_date)
                          : null}
                      </td>

                      <td>{item.country}</td>
                      <td>
                        {item.website.length ? (
                          <Linkify
                            coverText="Click here to visit"
                            data={item.website}
                          />
                        ) : (
                          'No link provided'
                        )}
                      </td>
                      <td>{item.category}</td>
                      <td className="text-wrap">{item.company_name}</td>
                      <td className="text-wrap">{item.contact_person}</td>
                      <td>{item.designation}</td>
                      <td className="text-wrap">{item.contact_number}</td>
                      <td className="text-wrap">{item.email_address}</td>
                      <CallingStatusTd data={item.calling_status} />
                      <td>
                        {item.linkedin.length ? (
                          <Linkify
                            coverText="Click here to visit"
                            data={item.linkedin}
                          />
                        ) : (
                          'No link provided'
                        )}
                      </td>
                      <td>
                        {item.test_given_date_history?.length ? 'Yes' : 'No'}
                      </td>
                      <td>
                        {item.is_prospected
                          ? `Yes (${item.followup_done ? 'Done' : 'Pending'})`
                          : 'No'}
                      </td>
                      <td
                        className="text-center"
                        style={{ verticalAlign: 'middle' }}
                      >
                        <div className="inline-block">
                          {item.lead_withdrawn ? (
                            'Withdrawn'
                          ) : (
                            <div className="flex gap-2">
                              <EditButton
                                isLoading={isLoading}
                                submitHandler={editLead}
                                leadData={item}
                              />
                              <DeleteButton
                                submitHandler={deleteLead}
                                leadData={item}
                              />
                              <WithdrawLeadButton
                                submitHandler={withdrawLead}
                                leadData={item}
                              />
                            </div>
                          )}
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
            <td colSpan={16} className=" align-center text-center">
              No Leads To Show.
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
