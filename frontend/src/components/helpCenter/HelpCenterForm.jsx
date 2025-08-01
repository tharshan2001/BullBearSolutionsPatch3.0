import React, { useState, useContext } from 'react';
import { FaSpinner, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import HeaderA from '../HeaderA';
import { useAuth } from '../../context/AuthProvider';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

const HelpCenterForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({
    message: ''
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      message: ''
    };

    if (!formData.message.trim()) {
      newErrors.message = "Please enter your message";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/help-center', {
        FullName: user?.fullName || user?.name || '', // Handle both fullName and name
        mailid: user?.email || '',
        message: formData.message
      });
      
      if (response.status === 201) {
        toast.success('Message sent successfully!');
        setFormData({ message: '' });
        setSubmitSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="mx-auto w-full px-15 pt-2 pb-10 max w-full bg-[#181b2c] min-h-screen">
        <HeaderA title="Help Center" onBack={() => navigate(-1)} />
        <div className="max-w-md mx-auto bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-10 mt-10 hover:border-[#33eed5]/30 transition-colors">
          <div className="flex justify-center mb-4">
            <FaCheck className="text-[#33eed5] text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Thank You!</h2>
          <p className="text-gray-300 mb-6 text-center">Your message has been sent successfully. We'll get back to you soon.</p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="w-full bg-gradient-to-r from-[#33eed5] to-[#2ac0a8] text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-15 pt-2 pb-10 max w-full bg-[#181b2c] min-h-screen">
      <HeaderA title="Help Center" onBack={() => navigate(-1)} />
      
      <div className="max-w-md mx-auto mt-30 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-10 mt-10 hover:border-[#33eed5]/30 transition-colors">
        <h2 className="text-xl font-bold text-white mb-6 text-center">Contact Help Center</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Name Field (read-only) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={user?.fullName || user?.name || ''} // Fallback to name if fullName doesn't exist
              readOnly
              className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-2 px-3 text-gray-400"
              style={{ cursor: 'default' }}
            />
          </div>

          {/* Email Field (read-only) */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-2 px-3 text-gray-400"
              style={{ cursor: 'default' }}
            />
          </div>

          {/* Message Field */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`w-full bg-[#2a2a32] border ${
                formErrors.message ? "border-red-500" : "border-[#3a3a42]"
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5]`}
              placeholder="How can we help you?"
              rows="5"
              disabled={isSubmitting}
            ></textarea>
            {formErrors.message && (
              <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !user}
            className="w-full bg-gradient-to-r from-[#33eed5] to-[#2ac0a8] text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HelpCenterForm;