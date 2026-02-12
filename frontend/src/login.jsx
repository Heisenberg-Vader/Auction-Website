import React, { useState } from 'react';
import { API_URL, fetchCsrfToken } from './App';

const Login = ({ onNavigate, onLogin, showToast }) => {
  const [userType, setUserType] = useState('client');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const csrfToken = await fetchCsrfToken();
    const payload = { ...formData, userType };

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      onLogin();
      showToast("Login successful", "success");
    } else {
      showToast(data.error, "error");
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
            <h1 className="text-3xl font-bold text-center text-gray-900">Login</h1>

            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => setUserType('client')}
                className={`px-4 py-2 rounded-md ${userType === 'client'
                  ? 'bg-blue-500 text-white hover:bg-blue-600 duration-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 duration-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                  }`}
              >
                User
              </button>
              <button
                onClick={() => setUserType('admin')}
                className={`px-4 py-2 rounded-md ${userType === 'admin'
                  ? 'bg-blue-500 text-white hover:bg-blue-600 duration-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 duration-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                  }`}
              >
                Admin
              </button>
            </div>
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
                  className="flex text-xs px-1">Don't have an account?
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate("register");
                    }}
                    className="block text-xs px-1 font-medium text-blue-700 cursor-pointer">
                    Sign Up
                  </a>
                </span>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 duration-500 focus:outline-none
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login as {userType === 'client' ? 'User' : 'Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;