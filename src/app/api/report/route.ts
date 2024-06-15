// @domain/api/report?action=...

import { NextResponse } from 'next/server';
import dbConnect from '@/utility/dbconnect';
dbConnect();
import getQuery from '@/utility/getapiquery';
import Report from '@/models/Reports';
import { auth } from '@/auth';
import { headers } from 'next/headers';
import Approval from '@/models/Approvals';
import getTodayDate from '@/utility/gettodaysdate';
import moment from 'moment-timezone';

async function handleEditReport(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let form_data = await req.json();

    let updatedReportData = await Report.findByIdAndUpdate(
      form_data._id,
      form_data,
      { new: true },
    );

    if (updatedReportData) {
      return { data: updatedReportData, status: 200 };
    } else {
      return { data: 'Unable to update report', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetRecallCount(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const marketerName: string = headers().get('name') || '';

    // Approved recalls count for today of the marketer
    const recallCount1 = await Report.countDocuments({
      marketer_name: marketerName,
      is_lead: false,
      calling_date_history: getTodayDate(),
      $expr: {
        $and: [
          { $gt: [{ $size: '$calling_date_history' }, 1] },
          {
            $ne: [
              { $arrayElemAt: ['$calling_date_history', 0] },
              getTodayDate(),
            ],
          },
        ],
      },
    });
    // Pending recalls count for today of the marketer
    const recallCount2 = await Approval.countDocuments({
      req_type: 'Report Edit',
      checked_by: 'None',
      is_rejected: false,
      is_lead: false,
      marketer_name: marketerName,
      calling_date_history: getTodayDate(),
      $expr: {
        $and: [
          { $gt: [{ $size: '$calling_date_history' }, 1] },
          {
            $ne: [
              { $arrayElemAt: ['$calling_date_history', 0] },
              getTodayDate(),
            ],
          },
        ],
      },
    });

    let recallCount = recallCount1 + recallCount2 || 0;
    return { data: recallCount, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleAddNewReport(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let session = await auth();
    let form_data = await req.json();

    let data = {
      marketer_id: session?.user.db_id,
      marketer_name: session?.user.real_name,
      calling_date: form_data.callingDate,
      followup_date: form_data.followupDate,
      country: form_data.country,
      designation: form_data.designation,
      website: form_data.website,
      category: form_data.category,
      company_name: form_data.company,
      contact_person: form_data.contactPerson,
      contact_number: form_data.contactNumber,
      email_address: form_data.email,
      calling_status: form_data.status,
      linkedin: form_data.linkedin,
      calling_date_history: [form_data.callingDate],
      updated_by: null,
      followup_done: form_data.followupDone,
      is_test: form_data.testJob,
      is_prospected: form_data.prospecting,
      prospect_status: form_data.prospectingStatus,
      is_lead: form_data.newLead,
      lead_withdrawn: false,
    };

    if (data.is_lead) {
      let existingReportData = await Report.findOne({
        company_name: {
          $regex: `^${data.company_name.trim()}$`,
          $options: 'i',
        },
      });

      if (!existingReportData) {
        let newReportData = await Report.create(data);

        if (newReportData) {
          return { data: newReportData, status: 200 };
        } else {
          return { data: 'Unable to create a new report', status: 400 };
        }
      } else {
        return { data: 'This lead already exists in database', status: 400 };
      }
    } else {
      let newReportData = await Report.create(data);

      if (newReportData) {
        return { data: newReportData, status: 200 };
      } else {
        return { data: 'Unable to create a new report', status: 400 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllReports(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const page: number = Number(headers().get('page')) || 1;
    const ITEMS_PER_PAGE: number = Number(headers().get('item_per_page')) || 30;
    const isFilter: boolean = headers().get('filtered') === 'true';
    const paginated: boolean = headers().get('paginated') === 'true';

    type Query = {
      country?: { $regex: string; $options: string };
      company_name?: { $regex: string; $options: string };
      category?: { $regex: string; $options: string };
      marketer_name?: { $regex: string; $options: string };
      is_test?: boolean;
      is_prospected?: boolean;
      is_lead?: boolean;
      followup_done?: boolean;
      permanent_client?: boolean;
      calling_date_history?: { [key: string]: any };
      $or?: { [key: string]: { $regex: string; $options: string } }[];
    };

    let filters = await req.json();

    let {
      country,
      companyName,
      category,
      marketerName,
      fromDate,
      toDate,
      test,
      prospect,
      generalSearchString,
      onlyLead,
      followupDone,
      permanentClient,
      staleClient,
    } = filters;

    let query: Query = {};

    if (country) query.country = { $regex: country, $options: 'i' };
    if (companyName)
      query.company_name = { $regex: companyName, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    if (marketerName)
      query.marketer_name = { $regex: marketerName, $options: 'i' };

    // If 'test' is true, filter to show only records where 'is_test' is true.
    // If 'test' is false or undefined, show all records regardless of 'is_test' value.
    // If 'prospect' is true, filter to show only records where 'is_prospected' is true.
    // If 'prospect' is false or undefined, show all records regardless of 'is_prospected' value.
    // If 'permanentClient' is true, filter to show only records where 'permanent_client' is true.
    // If 'permanentClient' is false or undefined, show all records regardless of 'permanent_client' value.
    if (test) query.is_test = test;
    if (prospect) query.is_prospected = prospect;
    if (permanentClient) query.permanent_client = permanentClient;

    // If 'followupDone' is neither undefined nor null, set 'query.followup_done' to the value of 'followupDone'.
    if (followupDone !== undefined && followupDone !== null)
      query.followup_done = followupDone;

    // Set 'query.is_lead' to the value of 'onlyLead' if it's true; otherwise, set it to false.
    query.is_lead = onlyLead || false;

    if (staleClient) {
      // Calculate the date 2 months ago from today
      let twoMonthsAgo = moment().subtract(2, 'months').format('YYYY-MM-DD');

      if (!query.calling_date_history) {
        query.calling_date_history = {};
      }

      if (!query.calling_date_history.$not) {
        query.calling_date_history.$not = {};
      }

      query.calling_date_history.$not.$elemMatch = {
        $gte: twoMonthsAgo,
      };
    }

    if (fromDate || toDate) {
      if (!query.calling_date_history) {
        query.calling_date_history = {};
      }

      if (!query.calling_date_history.$elemMatch) {
        query.calling_date_history.$elemMatch = {};
      }

      if (fromDate) {
        query.calling_date_history.$elemMatch.$gte = fromDate;
      }
      if (toDate) {
        query.calling_date_history.$elemMatch.$lte = toDate;
      }
    }

    // If there are no filters applied, clean up the query
    if (!fromDate && !toDate && !staleClient) {
      delete query.calling_date_history;
    }

    let searchQuery: Query = { ...query };

    if (!query && isFilter == true && !generalSearchString) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      if (generalSearchString) {
        searchQuery['$or'] = [
          { country: { $regex: generalSearchString, $options: 'i' } },
          { company_name: { $regex: generalSearchString, $options: 'i' } },
          { category: { $regex: generalSearchString, $options: 'i' } },
          { marketer_name: { $regex: generalSearchString, $options: 'i' } },
          { designation: { $regex: generalSearchString, $options: 'i' } },
          { website: { $regex: generalSearchString, $options: 'i' } },
          { contact_person: { $regex: generalSearchString, $options: 'i' } },
          { contact_number: { $regex: generalSearchString, $options: 'i' } },
          { calling_status: { $regex: generalSearchString, $options: 'i' } },
          { email_address: { $regex: generalSearchString, $options: 'i' } },
          { linkedin: { $regex: generalSearchString, $options: 'i' } },
        ];
      }

      const count: number = await Report.countDocuments(searchQuery);
      let reports: any;

      if (paginated) {
        reports = await Report.aggregate([
          { $match: searchQuery },
          {
            $sort: {
              createdAt: -1,
            },
          },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
        ]);
      } else {
        reports = await Report.find(searchQuery).lean();
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!reports) {
        return { data: 'Unable to retrieve reports', status: 400 };
      } else {
        let reportsData = {
          pagination: {
            count,
            pageCount,
          },
          items: reports,
        };

        return { data: reportsData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleWithdrawLead(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { id, req_by } = await req.json();

    let leadData = await Report.findByIdAndUpdate(
      id,
      {
        updated_by: req_by,
        is_lead: true,
        lead_withdrawn: true,
      },
      {
        new: true,
      },
    );

    // Withdrew the lead; now creating a new report with the same lead data
    if (leadData) {
      let reportData = await Report.create({
        calling_date: getTodayDate(),
        followup_date: leadData.followup_date,
        country: leadData.country,
        website: leadData.website,
        category: leadData.category,
        company_name: leadData.company_name,
        contact_person: leadData.contact_person,
        designation: leadData.designation,
        contact_number: leadData.contact_number,
        email_address: leadData.email_address,
        calling_status: leadData.calling_status,
        calling_date_history: [getTodayDate()],
        linkedin: leadData.linkedin,
        marketer_id: leadData.marketer_id,
        marketer_name: leadData.marketer_name,
        is_test: leadData.is_test,
        is_prospected: leadData.is_prospected,
        prospect_status: leadData.prospect_status,
        is_lead: false,
        lead_withdrawn: true,
        followup_done: leadData.followup_done,
      });

      if (reportData) {
        return { data: reportData, status: 200 };
      } else {
        return {
          data: 'Unable to create a new report using the lead data. Please create one manually',
          status: 400,
        };
      }
    } else {
      return { data: 'Unable to change the lead status', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleDoneFollowup(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const { id, req_by } = await req.json();

    let reportData = await Report.findByIdAndUpdate(
      id,
      {
        updated_by: req_by,
        followup_done: true,
      },
      {
        new: true,
      },
    );

    if (reportData) {
      return { data: reportData, status: 200 };
    } else {
      return { data: 'Unable to update the followup status', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetReportsCount(req: Request): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const marketerName: string = (headers().get('name') as string) || '';
    console.log(marketerName);

    const now = moment.tz('Asia/Dhaka');
    const startDate = now
      .clone()
      .subtract(12, 'months')
      .startOf('month')
      .toDate();
    const endDate = now.clone().endOf('month').toDate();

    interface ReportCount {
      [key: string]: number;
    }

    // Optimize the query with indexing and projections
    const reports = await Report.find({
      is_lead: false,
      marketer_name: marketerName,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select('createdAt')
      .exec();

    const result: ReportCount = {};

    // Initialize the result object with zero counts
    for (let i = 0; i <= 12; i++) {
      const month = now
        .clone()
        .subtract(i, 'months')
        .format('MMMM_YYYY')
        .toLowerCase();
      result[month] = 0;
    }

    // Count the reports per month
    reports.forEach((report) => {
      const month = moment(report.createdAt).format('MMMM_YYYY').toLowerCase();
      if (result.hasOwnProperty(month)) {
        result[month] += 1;
      }
    });

    // Sort the result by month
    const sortedResult: ReportCount = Object.keys(result)
      .sort((a, b) => moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')))
      .reduce((obj: ReportCount, key: string) => {
        obj[key] = result[key];
        return obj;
      }, {});

    return { data: sortedResult, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetClientConversionRates(req: Request): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const marketerName: string = (headers().get('name') as string) || '';
    console.log(marketerName);

    const now = moment.tz('Asia/Dhaka');
    const startDate = now
      .clone()
      .subtract(12, 'months')
      .startOf('month')
      .toDate();
    const endDate = now.clone().endOf('month').toDate();

    interface ReportCount {
      [key: string]: number;
    }

    // Optimize the query with indexing and projections
    const reports = await Report.find({
      is_lead: false,
      permanent_client: true,
      marketer_name: marketerName,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select('createdAt')
      .exec();

    const result: ReportCount = {};

    // Initialize the result object with zero counts
    for (let i = 0; i <= 12; i++) {
      const month = now
        .clone()
        .subtract(i, 'months')
        .format('MMMM_YYYY')
        .toLowerCase();
      result[month] = 0;
    }

    // Count the reports per month
    reports.forEach((report) => {
      const month = moment(report.createdAt).format('MMMM_YYYY').toLowerCase();
      if (result.hasOwnProperty(month)) {
        result[month] += 1;
      }
    });

    // Sort the result by month
    const sortedResult: ReportCount = Object.keys(result)
      .sort((a, b) => moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')))
      .reduce((obj: ReportCount, key: string) => {
        obj[key] = result[key];
        return obj;
      }, {});

    return { data: sortedResult, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetTestParticipationRates(req: Request): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const marketerName: string = (headers().get('name') as string) || '';
    console.log(marketerName);

    const now = moment.tz('Asia/Dhaka');
    const startDate = now
      .clone()
      .subtract(12, 'months')
      .startOf('month')
      .toDate();
    const endDate = now.clone().endOf('month').toDate();

    interface ReportCount {
      [key: string]: number;
    }

    // Optimize the query with indexing and projections
    const reports = await Report.find({
      is_lead: false,
      is_test: true,
      marketer_name: marketerName,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select('createdAt')
      .exec();

    const result: ReportCount = {};

    // Initialize the result object with zero counts
    for (let i = 0; i <= 12; i++) {
      const month = now
        .clone()
        .subtract(i, 'months')
        .format('MMMM_YYYY')
        .toLowerCase();
      result[month] = 0;
    }

    // Count the reports per month
    reports.forEach((report) => {
      const month = moment(report.createdAt).format('MMMM_YYYY').toLowerCase();
      if (result.hasOwnProperty(month)) {
        result[month] += 1;
      }
    });

    // Sort the result by month
    const sortedResult: ReportCount = Object.keys(result)
      .sort((a, b) => moment(a, 'MMMM_YYYY').diff(moment(b, 'MMMM_YYYY')))
      .reduce((obj: ReportCount, key: string) => {
        obj[key] = result[key];
        return obj;
      }, {});

    return { data: sortedResult, status: 200 };
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object; status: number };

  switch (getQuery(req).action) {
    case 'add-new-report':
      res = await handleAddNewReport(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-reports':
      res = await handleGetAllReports(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'edit-report':
      res = await handleEditReport(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'withdraw-lead':
      res = await handleWithdrawLead(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'done-followup':
      res = await handleDoneFollowup(req);
      return NextResponse.json(res.data, { status: res.status });

    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: Request) {
  let res: { data: string | Object; status: number };

  switch (getQuery(req).action) {
    case 'get-recall-count':
      res = await handleGetRecallCount(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-reports-count':
      res = await handleGetReportsCount(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-client-conversion-rates':
      res = await handleGetClientConversionRates(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-test-participation-rates':
      res = await handleGetTestParticipationRates(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
