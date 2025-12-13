'use client';

import { useState } from 'react';
import { ArrowLeft, User, Phone, CreditCard, BarChart3, LogOut, Edit, X, Save } from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('John Driver');
  const [phone, setPhone] = useState('555-0123');
  const [onDuty, setOnDuty] = useState(true);

  const handleBackToDashboard = () => {
    window.location.href = '/ambulance';
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Driver Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="bg-white p-4 rounded-full">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-2xl font-bold">{name}</h2>
                <p className="text-blue-100">Ambulance Driver</p>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Driver Information
            </h3>
            
            <div className="space-y-4">
              {/* Name */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{name}</p>
                )}
              </div>

              {/* Driver ID */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-sm text-gray-600 mb-1 block">Driver ID</label>
                <p className="text-lg font-semibold text-gray-900">AMB-001</p>
              </div>

              {/* Phone */}
              <div className="border-b border-gray-200 pb-4">
                <label className="text-sm text-gray-600 mb-1 block">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    {phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Statistics
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Trips */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Total Trips</p>
              <p className="text-4xl font-bold text-blue-900">24</p>
            </div>

            {/* On Duty Status */}
            <div className={`rounded-xl p-5 border ${
              onDuty 
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
            }`}>
              <p className={`text-sm mb-1 ${onDuty ? 'text-green-700' : 'text-gray-700'}`}>
                On Duty
              </p>
              <p className={`text-4xl font-bold ${onDuty ? 'text-green-900' : 'text-gray-900'}`}>
                {onDuty ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 rounded-xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}