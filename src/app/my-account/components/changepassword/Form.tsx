'use client';
import fetchData from '@/utility/fetch';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ChangePasswordDataState {
  username: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Form: React.FC = (props) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const [changePasswordData, setChangePasswordData] =
    useState<ChangePasswordDataState>({
      username: session?.user.cred_name || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setChangePasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const inputValidations = (changePasswordData: ChangePasswordDataState) => {
    // check if all required fields are filled
    if (
      changePasswordData.username === '' ||
      changePasswordData.oldPassword === '' ||
      changePasswordData.newPassword === '' ||
      changePasswordData.confirmPassword === ''
    ) {
      toast.error('All required fields must be filled');
      return false;
    }

    // check if new password and confirm password match
    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      toast.error('New password and confirm password must match');
      return false;
    }

    // password must be at least 8 characters long
    if (changePasswordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      if (!inputValidations(changePasswordData)) {
        return;
      }

      setLoading(true);

      let url: string =
        process.env.NEXT_PUBLIC_BASE_URL + '/api/user?action=change-password';
      let options: {} = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changePasswordData),
      };

      let response = await fetchData(url, options);

      if (response.ok) {
        setChangePasswordData({
          username: session?.user.cred_name || '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        toast.success('Changed the password successfully');
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred while submitting the form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePasswordSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
        <div>
          <label
            className="uppercase tracking-wide text-gray-700 text-sm font-bold flex gap-2 mb-2"
            htmlFor="grid-password"
          >
            Username
            <span className="cursor-pointer has-tooltip">
              &#9432;
              <span className="tooltip italic font-medium rounded-md text-xs shadow-lg p-1 px-2 bg-gray-100 ml-2">
                Filled automatically by session
              </span>
            </span>
          </label>
          <input
            disabled
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            name="username"
            value={changePasswordData.username}
            onChange={handleChange}
            type="text"
            required
            placeholder="Login username"
          />
        </div>

        <div>
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="grid-password"
          >
            Old Password
          </label>
          <input
            role="presentation"
            autoComplete="off"
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            name="oldPassword"
            value={changePasswordData.oldPassword}
            onChange={handleChange}
            type="text"
            required
            placeholder="Your old login password"
          />
        </div>

        <div>
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="grid-password"
          >
            New Password
          </label>
          <input
            role="presentation"
            autoComplete="off"
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            name="newPassword"
            value={changePasswordData.newPassword}
            onChange={handleChange}
            type="text"
            required
            placeholder="Your new login password"
          />
        </div>

        <div>
          <label
            className="block uppercase tracking-wide text-gray-700 text-sm font-bold mb-2"
            htmlFor="grid-password"
          >
            Confirm Password
          </label>
          <input
            role="presentation"
            autoComplete="off"
            className="appearance-none block w-full bg-gray-50 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            name="confirmPassword"
            value={changePasswordData.confirmPassword}
            onChange={handleChange}
            type="text"
            required
            placeholder="Retype your new login password"
          />
        </div>
      </div>

      <button
        className="rounded-md bg-primary text-white hover:opacity-90 hover:ring-4 hover:ring-primary transition duration-200 delay-300 hover:text-opacity-100 text-primary-foreground px-10 py-2 mt-4 uppercase"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Changing the password...' : 'Change'}
      </button>
    </form>
  );
};

export default Form;
