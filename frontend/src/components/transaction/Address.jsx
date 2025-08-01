import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { SiTether } from 'react-icons/si';
import { FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthProvider';
import logo from '../../assets/mybear.PNG';

const Address = () => {
  const { user } = useAuth();
  const [addressData, setAddressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [availableNetworks, setAvailableNetworks] = useState([]);

  const networkLabels = {
    TRC20: "TRC20 (Tron)",
    BEP20: "BEP20 (Binance Smart Chain)",
    ERC20: "ERC20 (Ethereum)",
    SOL: "Solana",
    AVAX: "Avalanche",
    MATIC: "Polygon"
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/addresses/latest`,
          { withCredentials: true }
        );

        const responseData = response.data?.data || response.data;
        const addressObj = Array.isArray(responseData) ? responseData[0] : responseData;

        if (addressObj) {
          setAddressData(addressObj);
          
          // Determine available networks with addresses
          const networks = Object.keys(networkLabels).filter(
            network => addressObj[network]
          );
          setAvailableNetworks(networks);
          
          // Set to TRC20 if available, otherwise first available network
          setSelectedNetwork(
            addressObj.TRC20 ? 'TRC20' : networks[0] || 'TRC20'
          );
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
        setError(err.response?.data?.message || 'Failed to load addresses');
        toast.error('Failed to load addresses');
        setAddressData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Address copied!');
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      console.error('Copy failed:', err);
      return false;
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-400">
        <p className="text-lg">Please login to view deposit addresses</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 p-6 mb-6 hover:border-[#33eed5]/30 transition-colors">
      <h2 className="text-lg font-semibold text-white mb-4">Deposit Address</h2>
      
      {error && (
        <div className="bg-red-900/20 border-l-4 border-red-500 p-3 mb-4 rounded text-sm text-red-200">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : !addressData || availableNetworks.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No address data available
        </div>
      ) : (
        <div className="space-y-4">
          {/* Network Selector */}
          <div className="relative">
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full bg-[#2a2a32] border border-[#3a3a42] rounded-lg py-2 px-3 text-white focus:outline-none focus:border-[#33eed5] appearance-none"
            >
              {availableNetworks.map((network) => (
                <option key={network} value={network}>
                  {networkLabels[network]}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-2 text-[#33eed5]">
              <FiChevronDown className="text-xl" />
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-2 rounded-lg relative">
              <QRCodeSVG 
                value={addressData[selectedNetwork]} 
                size={160} 
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain rounded border border-white" 
                />
              </div>
            </div>
          </div>

          {/* Address Display */}
          <div className="bg-[#2a2a32] p-3 rounded-lg border border-[#3a3a42]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <SiTether className="text-[#33eed5] mr-2" />
                <span className="text-sm text-gray-300">
                  {networkLabels[selectedNetwork]}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(addressData[selectedNetwork])}
                className={`text-xs px-3 py-1 rounded ${
                  copied 
                    ? 'bg-teal-500/20 text-teal-400' 
                    : 'bg-[#33eed5] hover:bg-[#2ac0a8] text-black'
                } transition-colors`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm font-mono text-gray-200 break-all">
                {addressData[selectedNetwork]}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Scan the QR code or copy the address to deposit USDT
          </p>
        </div>
      )}
    </div>
  );
};

export default Address;