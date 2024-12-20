import User from '@/models/Users';
import dbConnect from '@/utility/dbConnect';
import getQuery from '@/utility/getApiQuery';
import { NextResponse } from 'next/server';
dbConnect();

async function handleLogin(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  const username = req.headers.get('username');
  const password = req.headers.get('password');

  try {
    const userData = await User.findOne({
      name: username,
      password: password,
    });

    if (userData) {
      if (userData.role !== 'marketer') {
        return { data: 'You are not authorized to login', status: 400 };
      }
      return { data: userData, status: 200 };
    } else {
      return { data: 'Invalid username or password', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleGetAllMarketers(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  try {
    const marketersData = await User.find({
      role: 'marketer',
    });

    if (marketersData.length) {
      return { data: marketersData, status: 200 };
    } else {
      return { data: 'Unable to retrieve marketers data', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

async function handleChangePassword(req: Request): Promise<{
  data: string | Object;
  status: number;
}> {
  const { username, oldPassword, newPassword } = await req.json();

  try {
    const userData = await User.findOne({
      name: username,
      password: oldPassword,
    });

    if (userData) {
      userData.password = newPassword;
      await userData.save();
      return { data: 'Password changed successfully', status: 200 };
    } else {
      return { data: 'Invalid username or password', status: 400 };
    }
  } catch (e) {
    console.error(e);
    return { data: 'An error occurred', status: 500 };
  }
}

export async function GET(req: Request) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'handle-login':
      res = await handleLogin(req);
      return NextResponse.json(res.data, { status: res.status });
    case 'get-all-marketers':
      res = await handleGetAllMarketers(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}

export async function POST(req: Request) {
  let res: { data: string | Object; status: number };
  switch (getQuery(req).action) {
    case 'change-password':
      res = await handleChangePassword(req);
      return NextResponse.json(res.data, { status: res.status });
    default:
      return NextResponse.json({ response: 'OK' }, { status: 200 });
  }
}
