import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { SearchOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const ReferralTree = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState({});
  const [generationMap, setGenerationMap] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get('/api/referrals/graph');
        if (response.data?.success) {
          const data = response.data.data || { nodes: [], edges: [] };
          setGraphData(data);
          
          const rootNode = data.nodes?.find(node => node.parent === null);
          if (rootNode) {
            setExpandedNodes({ [rootNode.id]: true });
            const generations = { [rootNode.id]: 0 };
            calculateGenerations(data.nodes, generations);
            setGenerationMap(generations);
          }
        } else {
          setError(response.data?.message || 'Failed to load referral data');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching referral data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculateGenerations = (nodes, generations, parentId = null, currentGen = 0) => {
    nodes.forEach(node => {
      if (node.parent === parentId) {
        generations[node.id] = currentGen;
        calculateGenerations(nodes, generations, node.id, currentGen + 1);
      }
    });
  };

  const { childrenMap, teamCounts } = useMemo(() => {
    const cm = {};
    const tc = {};

    // Build children map and calculate team counts
    graphData.nodes?.forEach(node => {
      if (node.parent === null) return;
      if (!cm[node.parent]) cm[node.parent] = [];
      cm[node.parent].push(node);
    });

    const calculateTeamCount = (userId) => {
      let count = 0;
      if (cm[userId]) {
        count += cm[userId].length;
        cm[userId].forEach(child => {
          count += calculateTeamCount(child.id);
        });
      }
      tc[userId] = count;
      return count;
    };

    graphData.nodes?.forEach(node => {
      if (!tc[node.id]) {
        calculateTeamCount(node.id);
      }
    });

    return { childrenMap: cm, teamCounts: tc };
  }, [graphData.nodes]);

  const filteredNodes = useMemo(() => {
    if (!searchQuery) return graphData.nodes || [];
    const query = searchQuery.toLowerCase();
    return graphData.nodes.filter(node => 
      node.email.toLowerCase().includes(query) || 
      (node.fullName && node.fullName.toLowerCase().includes(query))
    );
  }, [graphData.nodes, searchQuery]);

  const shouldShowNode = (nodeId) => {
    if (!searchQuery) return true;
    const node = graphData.nodes.find(n => n.id === nodeId);
    if (!node) return false;
    
    const matchesSearch = 
      node.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (node.fullName && node.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  };

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMemberCard = (user) => {
    const sales = user.sales || {};
    const gen = generationMap[user.id] || 0;
    const memberCount = teamCounts[user.id] || 0;
    const hasChildren = !!childrenMap[user.id];
    const isExpanded = expandedNodes[user.id];

    return (
      <div 
        className={`w-full min-w-[320px] p-4 rounded-lg mb-2 transition-all duration-200 border h-[180px] flex flex-col ${
          isExpanded ? 'bg-slate-800 border-teal-400/30' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-teal-400/50'
        } ${hasChildren ? 'border-l-4 border-teal-400' : ''}`}
        onClick={() => hasChildren && toggleNode(user.id)}
      >
        <div className="flex justify-between items-start flex-grow-0">
          <div className="flex items-start space-x-2">
            {hasChildren && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(user.id);
                }}
                className={`mt-0.5 w-6 h-6 flex items-center justify-center rounded-md ${
                  isExpanded ? 'bg-teal-500' : 'bg-teal-500/50'
                } text-white text-sm font-bold hover:bg-teal-400 focus:outline-none`}
              >
                {isExpanded ? '−' : '+'}
              </button>
            )}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center space-x-2">
                <div className="font-medium text-white truncate max-w-[180px]">
                  {user.fullName || user.email}
                </div>
                <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">
                  Gen {gen}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate select-none">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs bg-slate-700/50 px-2 py-1 rounded text-teal-300">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-auto text-xs">
          <div className="bg-slate-700/30 rounded p-1.5 text-center">
            <div className="text-slate-400">Personal</div>
            <div className="text-teal-300 font-medium">${(sales.personalSales || 0).toFixed(2)}</div>
          </div>
          <div className="bg-slate-700/30 rounded p-1.5 text-center">
            <div className="text-slate-400">Direct</div>
            <div className="text-teal-300 font-medium">${(sales.directSponsorSales || 0).toFixed(2)}</div>
          </div>
          <div className="bg-slate-700/30 rounded p-1.5 text-center">
            <div className="text-slate-400">Group</div>
            <div className="text-teal-300 font-medium">${(sales.groupSales || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    return (
      <div className="space-y-3 w-full">
        {filteredNodes.map(user => (
          <div key={user.id}>
            {renderMemberCard(user)}
          </div>
        ))}
      </div>
    );
  };

  const renderChildren = (parentId, level = 0) => {
    if (!childrenMap[parentId]) return null;
    
    const childrenToShow = childrenMap[parentId].filter(child => 
      !searchQuery || shouldShowNode(child.id)
    );
    
    if (childrenToShow.length === 0) return null;
    
    return (
      <div className={`relative ${level > 0 ? 'md:ml-6 ml-4' : ''}`} key={`${parentId}-children`}>
        {level > 0 && (
          <div className="absolute left-4 top-0 bottom-0 w-px bg-teal-400/20 hidden md:block"></div>
        )}
        
        <div className="flex flex-col space-y-3">
          {childrenToShow.map((user) => {
            const hasChildren = !!childrenMap[user.id];
            
            return (
              <div key={user.id} className="relative">
                <div className="absolute left-0 top-7 w-4 h-px bg-teal-400/20 hidden md:block"></div>
                
                <div className="md:ml-4">
                  {renderMemberCard(user)}
                  
                  {hasChildren && expandedNodes[user.id] && !searchQuery && (
                    <div className="mt-2">
                      {renderChildren(user.id, level + 1)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const rootNode = graphData.nodes?.find(node => node.parent === null);
  const showRoot = !searchQuery || shouldShowNode(rootNode?.id);

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  );
  
  if (!user) return (
    <div className="text-center py-8 bg-slate-900/50 rounded-lg border border-slate-700/50 text-red-400">
      Please login to view your referral tree
    </div>
  );
  
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
      <div className="text-teal-400">Loading referral data...</div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8 bg-red-900/20 rounded-lg border border-red-700/50 text-red-400">
      {error}
    </div>
  );
  
  if (!rootNode) return (
    <div className="text-center py-8 bg-slate-900/50 rounded-lg border border-slate-700/50 text-slate-400">
      No referral data available.
    </div>
  );

  return (
    <div className="w-full px-2 sm:px-4 py-6 overflow-x-auto">
      <div className="min-w-[320px] mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="hidden md:flex flex-col space-y-1">
            <h1 className="text-2xl font-bold text-white">Team Network</h1>
            <p className="text-sm text-slate-400">View your referral hierarchy and team performance</p>
          </div>
          
          <div className="relative px-2 sm:px-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchOutlined className="text-slate-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search team members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          {/* Root Node Card - Separated from the tree */}
          {showRoot && (
            <div className="bg-slate-800 rounded-lg p-4 sm:p-5 border border-teal-400/30 shadow-lg w-full min-w-[320px] h-[180px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0 flex-grow-0">
                <div className="flex items-center space-x-2">
                  <div className="font-bold text-white truncate max-w-[200px] sm:max-w-none">
                    {rootNode.fullName || rootNode.email}
                  </div>
                  <span className="text-xs px-2 py-1 bg-teal-900/50 text-teal-300 rounded-full">You</span>
                </div>
                <div className="text-sm bg-teal-900/20 px-3 py-1 rounded-full text-teal-300">
                  {teamCounts[rootNode.id] || 0} {teamCounts[rootNode.id] === 1 ? 'member' : 'members'}
                </div>
              </div>
              
              <div className="text-xs text-slate-400 mb-3 select-none truncate">{rootNode.email}</div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs mt-auto">
                <div className="bg-slate-700/40 rounded-lg p-1 sm:p-2 text-center">
                  <div className="text-slate-400 mb-1">Personal</div>
                  <div className="text-teal-300 font-bold text-sm">${(rootNode.sales?.personalSales || 0).toFixed(2)}</div>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-1 sm:p-2 text-center">
                  <div className="text-slate-400 mb-1">Direct</div>
                  <div className="text-teal-300 font-bold text-sm">${(rootNode.sales?.directSponsorSales || 0).toFixed(2)}</div>
                </div>
                <div className="bg-slate-700/40 rounded-lg p-1 sm:p-2 text-center">
                  <div className="text-slate-400 mb-1">Group</div>
                  <div className="text-teal-300 font-bold text-sm">${(rootNode.sales?.groupSales || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Team Tree or Search Results */}
          <div className="w-full px-2 sm:px-0">
            {searchQuery ? (
              <div className="space-y-3 w-full">
                <h2 className="text-sm font-semibold text-teal-400 mb-4">SEARCH RESULTS</h2>
                {renderSearchResults()}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-teal-400">TEAM MEMBERS</h2>
                  <div className="text-xs text-slate-500">
                    {Object.keys(childrenMap[rootNode.id] || {}).length} direct members
                  </div>
                </div>
                
                <div className="space-y-3 w-full">
                  {renderChildren(rootNode.id)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralTree;