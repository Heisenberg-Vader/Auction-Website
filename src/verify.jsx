import React, { useState } from 'react';

const Verify = ({ onNavigate }) => {
  const [userType, setUserType] = useState('client'); // 'client' or 'admin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // 'type' is optional here; we'll merge userType on submit
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Merge userType into formData so it goes to the backend
    const payload = { ...formData, userType };

    console.log('Login attempted for:', payload);

    const response = await fetch("http://localhost:5000/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // Include userType here
    });
  
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem("token", data.token);
      alert("Login successful");
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
        Verified succesfully
      </div>
    </div>
  );
};

export default Verify;
