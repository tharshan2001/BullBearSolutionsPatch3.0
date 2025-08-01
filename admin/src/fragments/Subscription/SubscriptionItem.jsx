import React from "react";
import { FaCheckCircle, FaTimesCircle, FaSyncAlt, FaCalendarAlt, FaEnvelope, FaTag } from "react-icons/fa";
import toast from "react-hot-toast";

const SubscriptionItem = ({ 
  subscription, 
  onActivate, 
  onDeactivate,
  isActivating,
  isDeactivating
}) => {
  const {
    user: { email },
    product: { Title, Price },
    status,
    autoRenew,
    subscribedAt,
    _id
  } = subscription;

  const handleActivate = () => {
    toast.promise(
      onActivate(_id),
      {
        loading: 'Activating subscription...',
        success: 'Subscription activated!',
        error: (err) => err.message || 'Failed to activate subscription'
      }
    );
  };

  const handleDeactivate = () => {
    toast.promise(
      onDeactivate(_id),
      {
        loading: 'Deactivating subscription...',
        success: 'Subscription deactivated!',
        error: (err) => err.message || 'Failed to deactivate subscription'
      }
    );
  };

  return (
    <div className="relative p-6 rounded-lg bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md hover:border-gray-300">
      {/* Status badge */}
      <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold ${
        status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {status.toUpperCase()}
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-3">{Title}</h3>
      
      <div className="space-y-3 text-gray-700">
        <div className="flex items-center">
          <FaEnvelope className="mr-2 text-gray-500" />
          <span>{email}</span>
        </div>
        
        <div className="flex items-center">
          <FaTag className="mr-2 text-gray-500" />
          <span>${Price} / month</span>
        </div>
        
        <div className="flex items-center">
          <FaSyncAlt className="mr-2 text-gray-500" />
          <span>Auto Renew: {autoRenew ? 'Enabled' : 'Disabled'}</span>
        </div>
        
        <div className="flex items-center">
          <FaCalendarAlt className="mr-2 text-gray-500" />
          <span>Joined: {new Date(subscribedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-5 flex space-x-3">
        <button
          onClick={handleActivate}
          disabled={status === "active" || isActivating}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-all ${
            status === "active" 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${
            isActivating ? 'opacity-70 cursor-wait' : ''
          }`}
        >
          {isActivating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Activating...
            </>
          ) : (
            <>
              <FaCheckCircle />
              <span>Activate</span>
            </>
          )}
        </button>

        <button
          onClick={handleDeactivate}
          disabled={status === "inactive" || isDeactivating}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center space-x-2 transition-all ${
            status === "inactive" 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          } ${
            isDeactivating ? 'opacity-70 cursor-wait' : ''
          }`}
        >
          {isDeactivating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Deactivating...
            </>
          ) : (
            <>
              <FaTimesCircle />
              <span>Deactivate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionItem;