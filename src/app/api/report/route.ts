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
import {
  createRegexQuery,
  addBooleanField,
  addIfDefined,
  addRegexField,
  Query,
  RegexQuery,
} from '@/utility/reportsfilterhelpers';

async function handleEditReport(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    let form_data = await req.json();

    // If the regular client status is changed, update the onboard date
    let { regular_client, is_test, test_given_date_history } = form_data;
    if (
      regular_client !== undefined &&
      regular_client !== null &&
      regular_client !== ''
    ) {
      if (regular_client) {
        if (form_data.onboard_date === '') {
          form_data.onboard_date = getTodayDate();
        }
      } else {
        if (form_data.onboard_date !== '') {
          form_data.onboard_date = '';
        }
      }
    }

    // If the test status is changed, add the test given date to the history
    if (is_test) {
      if (test_given_date_history.length === 0) {
        form_data.test_given_date_history = [getTodayDate()];
      } else {
        let lastTestDate =
          test_given_date_history[test_given_date_history.length - 1];
        if (lastTestDate !== getTodayDate()) {
          form_data.test_given_date_history = [
            ...test_given_date_history,
            getTodayDate(),
          ];
        }
      }
      is_test = false;
    }

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
      is_test: false,
      is_prospected: form_data.prospecting,
      prospect_status: form_data.prospectingStatus,
      is_lead: form_data.newLead,
      lead_withdrawn: false,
      regular_client: false,
      test_given_date_history: form_data.testJob ? [form_data.testJob] : [],
      onboard_date: '',
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
    const session = await auth();
    const marketerNameFromSession: string = session?.user.real_name || '';

    const filters = await req.json();

    const {
      country,
      companyName,
      category,
      marketerName,
      fromDate,
      toDate,
      test,
      prospect,
      onlyLead,
      followupDone,
      regularClient,
      staleClient,
      prospectStatus,
      generalSearchString,
      show,
    } = filters;

    const query: Query = {};

    addRegexField(query, 'country', country);
    addRegexField(query, 'company_name', companyName);
    addRegexField(query, 'category', category);
    addRegexField(query, 'marketer_name', marketerName, true);
    addRegexField(query, 'prospect_status', prospectStatus, true);

    // addBooleanField(query, 'is_test', test);

    if (test === true) {
      query.test_given_date_history = { $exists: true, $ne: [] };
    }

    addBooleanField(query, 'is_prospected', prospect);

    query.is_lead = onlyLead || false;

    addIfDefined(query, 'followup_done', followupDone);
    addIfDefined(query, 'regular_client', regularClient);

    if (staleClient) {
      const twoMonthsAgo = moment().subtract(2, 'months').format('YYYY-MM-DD');
      query.calling_date_history = {
        $not: { $elemMatch: { $gte: twoMonthsAgo } },
      };
    }

    if (fromDate || toDate) {
      query.calling_date_history = query.calling_date_history || {};
      query.calling_date_history.$elemMatch = {
        ...(fromDate && { $gte: fromDate }),
        ...(toDate && { $lte: toDate }),
      };
    }

    if (!fromDate && !toDate && !staleClient) {
      delete query.calling_date_history;
    }

    // regular client view filter (/regular-clients)
    if (show) {
      switch (show) {
        case 'all':
          break;
        case 'others':
          if (marketerNameFromSession)
            query.marketer_name = {
              $not: createRegexQuery(marketerNameFromSession, true),
            };
          break;
        case 'mine':
          addRegexField(query, 'marketer_name', marketerNameFromSession, true);
          break;
        default:
          break;
      }
    }

    const searchQuery: Query = { ...query };

    let sortQuery: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    // Sorting by followup date (ascending) if followup is pending and not a regular client (/pending-followups)
    if (
      followupDone === false &&
      regularClient === false &&
      searchQuery.is_lead === false
    ) {
      sortQuery = {
        hasFollowupDate: 1, // Sort by presence of followup_date first (0 for missing, 1 for present)
        followup_date: 1, // Then sort by followup_date ascending
        createdAt: -1, // Finally, sort by createdAt descending
      };
    }

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
            $addFields: {
              hasFollowupDate: {
                $cond: {
                  if: { $eq: ['$followup_date', ''] },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
          { $sort: sortQuery },
          { $skip: skip },
          { $limit: ITEMS_PER_PAGE },
          {
            $project: {
              hasFollowupDate: 0, // Remove the added field from the final output
            },
          },
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
        is_test: false,
        is_prospected: leadData.is_prospected,
        prospect_status: leadData.prospect_status,
        is_lead: false,
        lead_withdrawn: true,
        followup_done: leadData.followup_done,
        regular_client: leadData.regular_client,
        test_given_date_history: leadData.test_given_date_history || [],
        onboard_date: '',
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

async function handleGetClientsOnboard(req: Request): Promise<{
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
      regular_client: true,
      marketer_name: marketerName,
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .select('onboard_date')
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
      const month = moment(report.onboard_date)
        .format('MMMM_YYYY')
        .toLowerCase();
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

async function handleGetTestOrdersTrend(req: Request): Promise<{
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

    // Initialize the result object with zero counts
    const result: ReportCount = {};
    for (let i = 0; i <= 12; i++) {
      const month = now
        .clone()
        .subtract(i, 'months')
        .format('MMMM_YYYY')
        .toLowerCase();
      result[month] = 0;
    }

    // Optimize the query with indexing, projections, and date range filtering
    const reports = await Report.find({
      is_lead: false,
      marketer_name: marketerName,
      test_given_date_history: {
        $elemMatch: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    })
      .select('test_given_date_history')
      .exec();

    // Count the test_given_date_history dates per month
    reports.forEach((report) => {
      report.test_given_date_history.forEach((testDate: string) => {
        const testMoment = moment(testDate);
        if (testMoment.isBetween(startDate, endDate, 'day', '[]')) {
          const month = testMoment.format('MMMM_YYYY').toLowerCase();
          if (result.hasOwnProperty(month)) {
            result[month] += 1;
          }
        }
      });
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

async function handleGetReportsStatus(req: Request): Promise<{
  data: string | Record<string, number>;
  status: number;
}> {
  try {
    const marketerName: string = (headers().get('name') as string) || '';
    console.log(marketerName);

    const { fromDate, toDate } = await req.json();

    const totalCalls = await Report.countDocuments({
      marketer_name: marketerName,
      calling_date_history: {
        $elemMatch: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
      is_lead: false,
    });

    const totalLeads = await Report.countDocuments({
      marketer_name: marketerName,
      calling_date_history: {
        $elemMatch: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
      is_lead: true,
    });

    let totalTests: number = 0;
    const testReports = await Report.find({
      is_lead: false,
      marketer_name: marketerName,
      test_given_date_history: {
        $elemMatch: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
    })
      .select('test_given_date_history')
      .exec();
    testReports.forEach((report) => {
      report.test_given_date_history.forEach((testDate: string) => {
        const testMoment = moment(testDate);
        if (testMoment.isBetween(fromDate, toDate, 'day', '[]')) {
          totalTests += 1;
        }
      });
    });

    const totalProspects = await Report.countDocuments({
      marketer_name: marketerName,
      calling_date_history: {
        $elemMatch: {
          $gte: fromDate,
          $lte: toDate,
        },
      },
      is_prospected: true,
      is_lead: false,
    });

    let data = {
      totalCalls: totalCalls || 0,
      totalLeads: totalLeads || 0,
      totalTests: totalTests || 0,
      totalProspects: totalProspects || 0,
    };

    return {
      data,
      status: 200,
    };
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
    case 'get-reports-status':
      res = await handleGetReportsStatus(req);
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
    case 'get-clients-onboard':
      res = await handleGetClientsOnboard(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-test-orders-trend':
      res = await handleGetTestOrdersTrend(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
