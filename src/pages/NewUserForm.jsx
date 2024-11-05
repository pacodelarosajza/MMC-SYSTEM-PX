import React, { useState } from 'react';
import axios from 'axios';

const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

const NewUserForm = () => {
  const [formData, setFormData] = useState({
    user_type_id: '',
    user_number: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === 'password') {
      assessPasswordStrength(value);
    }
  };

  const assessPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength('Too weak');
    } else if (/[A-Z]/.test(password) && /[0-9]/.test(password)) {
      setPasswordStrength('Strong');
    } else {
      setPasswordStrength('Moderate');
    }
  };

  const handleUserTypeChange = (e) => {
    const userType = e.target.value;
    let userTypeId;
    switch (userType) {
      case 'Admin':
        userTypeId = 1;
        break;
      case 'Operational':
        userTypeId = 2;
        break;
      case 'Viewer':
        userTypeId = 3;
        break;
      default:
        userTypeId = '';
    }
    setFormData({ ...formData, user_type_id: userTypeId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    try {
      const response = await axios.post(`${apiIpAddress}/api/users`, formData);
      setStatusMessage('User created successfully!');
      console.log(response.data);
      resetForm();
    } catch (error) {
      setStatusMessage(`Error creating user: ${error.response?.data?.message || error.message}`);
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      user_type_id: '',
      user_number: '',
      email: '',
      password: '',
    });
    setShowPreview(false);
    setPasswordStrength('');
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-1">
      <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-white mb-4">Create User</h2>

        {loading && (
          <div className="flex justify-center mb-4">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-600 h-8 w-8"></div>
          </div>
        )}

        {statusMessage && (
          <div
            className={`mb-4 p-2 text-center rounded text-sm ${
              statusMessage.includes('Error') ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="user_number"
              value={formData.user_number}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500 text-white"
              placeholder="User Number"
              required
            />
            <small className="text-gray-500">Unique identifier for the user</small>
          </div>
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500 text-white"
              placeholder="Email"
              required
            />
            <small className="text-gray-500">User's email address</small>
          </div>
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500 text-white"
              placeholder="Password"
              required
            />
            <small className={`text-gray-500 ${passwordStrength === 'Strong' ? 'text-green-500' : passwordStrength === 'Moderate' ? 'text-yellow-500' : 'text-red-500'}`}>
              Password Strength: {passwordStrength}
            </small>
          </div>
          <div>
            <select
              name="user_type"
              onChange={handleUserTypeChange}
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring focus:ring-blue-500 text-white"
              required
            >
              <option value="">Select User Type</option>
              <option value="Admin">Admin</option>
              <option value="Operational">Operational</option>
              <option value="Viewer">Viewer</option>
            </select>
            <small className="text-gray-500">Choose the type of user</small>
          </div>
          <button
            type="button"
            onClick={togglePreview}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold p-3 rounded focus:outline-none focus:ring focus:ring-gray-500"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          {showPreview && (
            <div className="mt-4 bg-gray-700 p-4 rounded">
              <h3 className="text-lg font-semibold text-white">User Preview</h3>
              <p><strong>User Number:</strong> {formData.user_number}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Password:</strong> {formData.password.replace(/./g, '*')}</p>
              <p><strong>User Type:</strong> {formData.user_type_id ? (formData.user_type_id === '1' ? 'Admin' : formData.user_type_id === '2' ? 'Operational' : 'Viewer') : 'N/A'}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded focus:outline-none focus:ring focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};



export default NewUserForm;
