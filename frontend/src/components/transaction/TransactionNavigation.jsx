import { useNavigate } from "react-router-dom";
import {
  StarBorderPurple500Outlined,
  KeyboardArrowRight,
} from "@mui/icons-material";

const navigationItems = [
  {
    title: "Wallet History",
    path: "/transaction",
  },
    {
    title: "Commision History",
    path: "/commision",
  },

];

const TransactionNavigation = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 px-10 mt-6 mb-10">
      <header className="py-4 flex flex-col items-start justify-center">
        <h1 className="text-1xl font-bold text-white text-center">My Transactions</h1>
        <div className="w-20 h-[1.5px] rounded-full bg-gradient-to-r from-teal-600 to-teal-300 mt-2" />
      </header>
      {navigationItems.map((item, index) => (
        <div
          key={index}
          className="
            relative
            bg-gradient-to-br from-slate-800 to-slate-900
            rounded-xl border border-slate-700
            p-2.5 hover:border-teal-400/30
            transition-colors duration-200
            cursor-pointer
            w-full
            group
            overflow-hidden
          "
          onClick={() => navigate(item.path)}
        >
          {/* Holographic effect strip */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400/30 to-transparent opacity-20"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-s text-white">{item.title}</span>
            </div>

            <div className="flex items-center">
              <div className="text-slate-100 group-hover:text-teal-300 transition-colors">
                <KeyboardArrowRight fontSize="small" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionNavigation;