import { useEmailStore } from "../store/useEmailStore";
import { askNotificationPermissionOnFirstVisit } from './lib/utils';
import React, { useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import NoEmailSelected from "../components/NoEmailSelected";
import EmailViewer from "../components/EmailViewer";

const HomePage = () => {
  useEffect(() => {
    askNotificationPermissionOnFirstVisit();
  }, []);
  const { selectedEmail } = useEmailStore();
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />

            {!selectedEmail ? <NoEmailSelected /> : <EmailViewer />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;