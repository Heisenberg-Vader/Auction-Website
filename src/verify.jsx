import React, { useEffect, useState } from "react";

const Verify = ({ onNavigate }) => {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Extract the `status` from the URL
    const params = new URLSearchParams(window.location.search);
    setStatus(params.get("status"));
  }, []);

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col items-center justify-center overflow-hidden bg-gray-100">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg overflow-hidden">
          {status === "success" ? (
            <>
              <h1 className="text-green-600 text-2xl font-bold">Email Verified Successfully! :)</h1>
              <p className="text-gray-700 mt-2">You can now log in to your account.</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 duration-300
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => onNavigate("login")} 
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              <h1 className="text-red-600 text-2xl font-bold">Verification Failed :(</h1>
              <p className="text-gray-700 mt-2">Invalid or expired token. Try registering again.</p>
              <button 
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 duration-300
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={() => onNavigate("register")} 
              >
                Register Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verify;