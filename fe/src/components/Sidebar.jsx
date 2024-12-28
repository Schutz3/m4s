import { useEffect, useState } from "react";
import { useEmailStore } from "../store/useEmailStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { Search, X } from "lucide-react";

const Sidebar = () => {
  const { getEmails, emails, selectedEmail, setSelectedEmail, isEmailsLoading } = useEmailStore();
  const { isSidebarOpen, toggleSidebar } = useSidebarStore();
  const [searchTerm, setSearchTerm] = useState("");
  const clearSearch = () => {
    setSearchTerm("");
  };
  

  useEffect(() => {
    getEmails();
  }, [getEmails]);

  const filteredEmails = Array.isArray(emails)
    ? emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.from.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  if (isEmailsLoading) return <div></div>;

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        h-full w-72 border-r border-base-300 flex flex-col
        fixed lg:static top-0 left-0 z-20
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-base-100 lg:bg-transparent
        pt-16 lg:pt-0 overflow-hidden
      `}>
        <div className="border-b border-base-300 w-full p-5 flex items-center justify-between 
                  sticky top-0 bg-base-100 z-10
                  mt-4 lg:mt-0 pb-6 lg:pb-5">
          <div className="flex items-center gap-2 flex-grow">
            <Search className="w-6 h-6 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full max-w-xs py-3 lg:py-2"
            />
          </div>
          <button
            className="lg:hidden btn btn-ghost btn-sm flex-shrink-0"
            onClick={() => {
              if (searchTerm) {
                clearSearch();
              } else {
                toggleSidebar();
              }
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow w-full">
          {filteredEmails.length > 0 ? (
            filteredEmails.map((email) => (
              <button
                key={email._id}
                onClick={() => {
                  setSelectedEmail(email);
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                className={`
                  w-full p-3 flex flex-col items-start gap-1
                  hover:bg-base-300 transition-colors
                  ${selectedEmail?._id === email._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                `}
              >
                <div className="font-medium truncate w-full text-left">{email.subject}</div>
                <div className="text-sm text-zinc-400 truncate w-full text-left">{email.from}</div>
                <div className="text-xs text-zinc-500 w-full text-left">
                  {new Date(email.receivedAt).toLocaleString()}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center text-zinc-500 py-4">
              {Array.isArray(emails) ? "No emails found" : "Error loading emails"}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;