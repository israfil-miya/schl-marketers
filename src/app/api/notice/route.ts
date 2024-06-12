import { NextResponse } from 'next/server';
import dbConnect from '@/utility/dbconnect';
dbConnect();
import Notice from '@/models/Notices';
import getQuery from '@/utility/getapiquery';
import { headers } from 'next/headers';

async function handleGetAllNotices(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const page: number = Number(headers().get('page')) || 1;
    const ITEMS_PER_PAGE: number = Number(headers().get('item_per_page')) || 30;
    const isFilter: boolean = headers().get('filtered') === 'true';
    const paginated: boolean = headers().get('paginated') === 'true';

    type Query = {
      channel?: string;
      title?: { $regex: string; $options: string };
      notice_no?: { $regex: string; $options: string };
      updatedAt?: { $gte?: string; $lte?: string };
    };

    type Filters = {
      channel: string;
      title: string;
      noticeNo: string;
      fromDate: string;
      toDate: string;
    };

    let filters = await req.json();

    let { channel, title, noticeNo, fromDate, toDate }: Filters = filters;

    let query: Query = {};

    if (channel) query.channel = channel;
    if (noticeNo) query.notice_no = { $regex: `^${noticeNo}$`, $options: 'i' };
    if (title) query.title = { $regex: title, $options: 'i' };

    if (fromDate || toDate) {
      query.updatedAt = query.updatedAt || {};
      if (fromDate) {
        query.updatedAt.$gte = fromDate;
      }
      if (toDate) {
        query.updatedAt.$lte = toDate;
      }
    }

    let searchQuery: Query = { ...query };

    if (!query && isFilter == true) {
      return { data: 'No filter applied', status: 400 };
    } else {
      const skip = (page - 1) * ITEMS_PER_PAGE;

      const count: number = await Notice.countDocuments(searchQuery);
      let notices: any;

      if (paginated) {
        notices = await Notice.aggregate([
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
        notices = await Notice.find(searchQuery).lean();
      }

      console.log('SEARCH Query:', searchQuery);

      const pageCount: number = Math.ceil(count / ITEMS_PER_PAGE);

      if (!notices) {
        return { data: 'Unable to retrieve notices', status: 400 };
      } else {
        let noticesData = {
          pagination: {
            count,
            pageCount,
          },
          items: notices,
        };

        return { data: noticesData, status: 200 };
      }
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetNotice(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const notice_no: string | null = headers().get('notice_no');
    const notice = await Notice.findOne({ notice_no }).lean();
    if (!notice) {
      return { data: 'Notice not found', status: 404 };
    } else {
      return { data: notice, status: 200 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'get-all-notices':
      res = await handleGetAllNotices(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function GET(req: Request) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'get-notice':
      res = await handleGetNotice(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
