import { Mail } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NoEmailSelected = () => {
  const { authUser } = useAuthStore();
  const [domainData, setDomainData] = useState({ domains: [], date: "" });
  const [isLoading, setIsLoading] = useState(true); // State untuk loading

  const username = authUser?.username || authUser?.user?.username || "usernamelo";

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await fetch("https://raw.githubusercontent.com/Schutz3/m4s/refs/heads/main/dom.json");
        if (!response.ok) {
          throw new Error("Gagal mengambil data domain");
        }
        const data = await response.json();
        setDomainData({ domains: data.domain, date: data.date });
      } catch (error) {
        console.error("Error fetching domain data:", error);

      } finally {
        setIsLoading(false);
      }
    };

    fetchDomains();
  }, []);

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce"
            >
              <Mail className="w-8 h-8 text-primary " />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold">Welcome to Mail4Spam!</h2>
        <p className="text-base-content/60">
          Your place for store all incoming emails safely.
          you can receive any of your spam emails with this following address:
        </p>
        
        <div className="text-left bg-base-200 p-4 rounded-md">
            {isLoading ? (
                <p>Loading domains...</p>
            ) : (
                <ul className="list-disc list-inside space-y-1">
                    {domainData.domains.map((domain, index) => (
                        <li key={index} className="font-mono">{username}@{domain}</li>
                    ))}
                </ul>
            )}
        </div>

        <div className="text-sm text-base-content/60 space-y-2">
            <p>
              Developed by: <Link to="https://github.com/Schutz3" className="link link-hover">Hann</Link>
            </p>
            {domainData.date && (
              <p>
                Domains last updated: {domainData.date}
              </p>
            )}
            <p>
              <Link to="/about" className="link link-hover">About this tool</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default NoEmailSelected;