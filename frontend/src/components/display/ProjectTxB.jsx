const ProjectTxB = () => {
  return (
    <div className="px-0 py-4 max-w-4xl mx-auto">
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl p-4 backdrop-blur-sm border border-slate-700/40 hover:border-teal-400/30 transition-all duration-300 group">
        {/* Holographic effect strip (matches ProductList) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent opacity-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            {/* Glowing text effect matching your price display */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
              Project FXFlow
            </h1>
          </div>
          
          {/* Subtitle with same styling as disclaimer text */}
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider">
          </p>
        </div>
        
        {/* Subtle hover indicator matching your buttons */}
      </div>
    </div>
  );
};

export default ProjectTxB;