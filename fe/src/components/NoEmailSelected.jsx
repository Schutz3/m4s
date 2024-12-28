import { Mail } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
const NoEmailSelected = () => {
  const { authUser } = useAuthStore();
  const emailDomains = ['enjel.pw', 'firebyte.us', 'sst-esport.eu.org', 'schutze.eu.org'];
  const username = authUser?.username || authUser?.user?.username || "usernamelo";
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center animate-bounce"
            >
              <Mail className="w-8 h-8 text-primary " />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Welcome to Mail4Spam!</h2>
        <p className="text-base-content/60">
          Your place for store all incoming emails safely.
          you can receive any of your spam emails with this following address:
          <ul>
          {emailDomains.map((domain, index) => (
            <li key={index}>{username}@{domain}</li>
          ))}
        </ul>
        </p>
        <p className="text-base-content/60">
        Developed by: <Link to="https://github.com/Schutz3">Hann</Link><br></br>
        <Link to="/about">About this tool</Link>
        </p>
      </div>
    </div>
  );
};

export default NoEmailSelected;
