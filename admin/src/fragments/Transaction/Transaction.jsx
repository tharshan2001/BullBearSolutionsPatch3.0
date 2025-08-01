import React, { useState } from "react";
import { FaCheck, FaTimes, FaSpinner, FaLink, FaExchangeAlt, FaWallet, FaCopy } from "react-icons/fa";
import { IoCopyOutline, IoCheckmarkDone } from "react-icons/io5";

const Transaction = ({ tx, onApprove, onReject, isApproving, isRejecting }) => {
  const [copiedAddress, setCopiedAddress] = useState(false);

  const getTypeDisplayText = (type) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'transfer':
        return 'Transfer';
      case 'swap':
        return 'Swap';
      default:
        return 'Transaction';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `${import.meta.env.VITE_API_BASE_URL}${filePath}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md mb-4">
      <div className="flex justify-between items-start">
        <div className="w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">
                {getTypeDisplayText(tx.type)} - {Math.abs(tx.amount).toFixed(2)} {tx.currency.toUpperCase()}
              </h3>
              <p className="text-sm text-gray-500">
                {tx.user ? (
                  <>
                    {tx.user.fullName} ({tx.user.email})
                  </>
                ) : (
                  "Unknown user"
                )}
                {" • "}
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                {tx.status}
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="mt-4 text-sm">
            {tx.description && (
              <p className="text-gray-700 mb-2">
                <span className="text-gray-500">Description:</span> {tx.description}
              </p>
            )}

            {tx.referenceId && (
              <p className="text-gray-700 mb-2">
                <span className="text-gray-500">{tx.type === 'transfer' ? 'Recipient ID' : 'Reference ID'}:</span> {tx.referenceId}
              </p>
            )}

            {/* Enhanced Network Address Section */}
            {(tx.network || tx.networkAddress) && (
              <div className="mb-2">
                <p className="text-gray-500 flex items-center">
                  <FaWallet className="mr-2 text-gray-400" /> Network Details:
                </p>
                <div className="bg-gray-50 rounded p-3 mt-1 border border-gray-100">
                  {tx.network && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Network:</span> {tx.network}
                    </p>
                  )}
                  {tx.networkAddress && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-500 mb-1">Wallet Address:</p>
                        <button
                          onClick={() => copyToClipboard(tx.networkAddress)}
                          className="text-xs flex items-center text-green-600 hover:text-green-700 transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress ? (
                            <>
                              <IoCheckmarkDone className="mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <IoCopyOutline className="mr-1" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-gray-100 p-2 rounded break-all font-mono text-xs text-gray-700 mt-1">
                        {tx.networkAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tx.meta && (
              <div className="mb-2">
                <p className="text-gray-500">Transaction Fees:</p>
                <div className="bg-gray-50 rounded p-3 mt-1 border border-gray-100">
                  {tx.meta.fee && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Fee:</span> {tx.meta.fee} {tx.currency.toUpperCase()}
                    </p>
                  )}
                  {tx.meta.netAmountAfterFee && (
                    <p className="text-gray-700">
                      <span className="text-gray-500">Net Amount:</span> {tx.meta.netAmountAfterFee} {tx.currency.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {tx.files && tx.files.length > 0 && (
              <div className="mb-2">
                <p className="text-gray-500 flex items-center">
                  <FaLink className="mr-2 text-gray-400" /> Receipt/Proof:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {tx.files.map((file, index) => (
                    <a 
                      key={index} 
                      href={getFileUrl(file.url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center bg-gray-50 rounded p-2 hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      <div className="flex-shrink-0 mr-2 text-gray-500">
                        {file.type.startsWith('image/') ? (
                          <img 
                            src={getFileUrl(file.url)} 
                            alt={file.name} 
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <FaLink className="text-lg" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.type}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {tx.type === 'swap' && (
              <div className="flex items-center text-gray-700">
                <FaExchangeAlt className="mr-2 text-gray-500" />
                <span>Swapped {tx.amount} {tx.currency.toUpperCase()} to CW</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {tx.status === "pending" && (
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={onApprove}
            disabled={isApproving}
            className={`px-4 py-2 rounded-md flex items-center ${
              isApproving
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            } transition-colors`}
          >
            {isApproving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FaCheck className="mr-2" />
                Approve
              </>
            )}
          </button>

          <button
            onClick={onReject}
            disabled={isRejecting}
            className={`px-4 py-2 rounded-md flex items-center ${
              isRejecting
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
            } transition-colors`}
          >
            {isRejecting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <FaTimes className="mr-2" />
                Reject
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Transaction;