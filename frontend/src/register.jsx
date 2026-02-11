import React, { useState } from 'react';

const EmailVerification = ({ email }) => {
  return (
    <div className="flex text-yellow-600 text-xs">
      Sent verification email to: {email}
    </div>
  );
}

const Register = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { ...formData, userType: "client" };

    console.log('Registration attempted for:', payload);

    const response = await fetch("http://localhost:5000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      setVerificationEmailSent(true);
    } else {
      alert(data.error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="h-[calc(100vh-72px)] flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-center text-gray-900">Sign Up</h1>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm 
                  focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm 
                  focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <span
                  className="flex text-xs px-1">Already have an account?
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate("login");
                    }}
                    className="block text-xs px-1 font-medium text-blue-700 cursor-pointer">
                    Login
                  </a>
                </span>
              </div>

              {verificationEmailSent && <EmailVerification email={formData.email} />}

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 duration-500 focus:outline-none
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign up
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;