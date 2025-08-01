import React from "react";

const Transaction = ({ tx }) => {
  // Construct full file URL using the backend base URL
  const getFileUrl = (filePath) => {
    // Remove leading slash if present to avoid double slashes
    const path = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `${import.meta.env.VITE_API_BASE_URL}/${path}`;
  };

  return (
    <div className="
      border border-slate-700 rounded-xl p-4 
      bg-gradient-to-br from-slate-800/50 to-slate-900/80
      hover:shadow-lg hover:shadow-teal-500/10
      transition-all duration-300
      group
    ">
      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-medium text-slate-200 capitalize">
          {tx.type}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            tx.status === "completed"
              ? "bg-teal-900/50 text-teal-300 border border-teal-700/50"
              : tx.status === "pending"
              ? "bg-amber-900/50 text-amber-300 border border-amber-700/50"
              : "bg-rose-900/50 text-rose-300 border border-rose-700/50"
          }`}
        >
          {tx.status}
        </span>
      </div>

      <div className="text-slate-300 space-y-2 text-sm">
        <p className="flex gap-1">
          <span className="text-slate-400 font-medium">Amount:</span> 
          <span className="text-teal-300">
            {tx.amount} {tx.currency.toUpperCase()}
          </span>
        </p>
        
        {tx.description && (
          <p className="flex gap-1">
            <span className="text-slate-400 font-medium">Description:</span> 
            <span>{tx.description}</span>
          </p>
        )}

        {tx.type === "withdrawal" && tx.network && (
          <div className="space-y-2">
            <p className="flex gap-1">
              <span className="text-slate-400 font-medium">Network:</span> 
              <span className="text-purple-300">{tx.network}</span>
            </p>
            <p className="flex gap-1 break-all">
              <span className="text-slate-400 font-medium">Address:</span> 
              <span className="text-blue-300">{tx.networkAddress}</span>
            </p>
            {tx.meta && (
              <>
                <p className="flex gap-1">
                  <span className="text-slate-400 font-medium">Fee:</span> 
                  <span className="text-rose-300">{tx.meta.fee}</span>
                </p>
                <p className="flex gap-1">
                  <span className="text-slate-400 font-medium">Net Amount:</span> 
                  <span className="text-teal-300">{tx.meta.netAmountAfterFee}</span>
                </p>
              </>
            )}
          </div>
        )}

        {tx.files && tx.files.length > 0 && (
          <div className="mt-3">
            <p className="text-slate-400 font-medium mb-1">Files:</p>
            <div className="flex flex-wrap gap-2">
              {tx.files.map((file) => (
                <a
                  key={file._id}
                  href={getFileUrl(file.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    px-3 py-1 rounded-full text-xs
                    bg-slate-700/50 text-blue-300 
                    border border-slate-600
                    hover:bg-slate-700 hover:text-blue-200
                    transition-colors
                  "
                >
                  {file.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <p className="flex gap-1 pt-2 text-slate-400 text-xs">
          <span>Created:</span> 
          <span>{new Date(tx.createdAt).toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
};

export default Transaction;