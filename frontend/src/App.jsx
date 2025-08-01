import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Profile from "./pages/Profile";
import Register from "./components/Register";
import Login from "./components/Login";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/AuthProvider";
import Referalpage from "./pages/ReferalPage";
import HomePage from "./pages/HomePage";
import ReferPage from "./pages/ReferFriendPage";
import ProductPage from "./pages/ProductPage";
import PremiumRoute from "./routes/PremiumRoute";
import UpgradeToPremium from "./components/premium/UpgradePremium";
import ProductDetails from "./components/product/ProductDetails";
import Notification from "./components/notifications/Notification";
import LoadingSpinner from "./components/LoadingSpinner";
import "./index.css";
import UpdatePage from "./pages/UpdatePage";
import { Toaster } from "react-hot-toast";
import AccountPage from "./pages/AccountPage";
import DepositForm from "./components/transaction/DepositForm";
import WithdrawalForm from "./components/transaction/WithdrawalForm";
import TransferForm from "./components/transaction/TransferForm";
import SwapForm from "./components/transaction/SwapForm";
import PremiumPage from "./pages/PremiumPage";
import SubscriptionsPage from "./components/premium/SubscriptionsPage";
import TransactionList from "./components/transaction/TransactionList";
import CurrencyConverter from "./components/display/CurrencyConverter";
import Carsoul from "./components/display/Carsoul";
import AssemblyOfGods from "./components/display/AssemblyOfGods";
import OTPForm from "./components/secure/OTPForm";
import OTPFlow from "./components/OTPFlow";
import CommissionNotifications from "./components/notifications/CommissionNotifications";
import ResourceList from "./components/resources/ResourceList";
import ProductList from "./components/product/ProductList";
import ResetPinForm from "./components/secure/ResetPinForm";
import ResetPasswordForm from "./components/secure/ResetPasswordForm";
import PrivacyPage from "./pages/PrivacyPage";
import HelpCenterForm from "./components/helpCenter/HelpCenterForm";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const delay = 500 + Math.random() * 1000;
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: "#2a2a2a",
            color: "#e0e0e0",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            fontWeight: "500",
            fontSize: "0.85rem",
            padding: "8px 14px",
            borderRadius: "6px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
            maxWidth: "350px",
            textAlign: "center",
          },
        }}
      />

      <div className="app-container">
        <div className="app-content">
          <AuthProvider>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/otp" element={<OTPForm />} />
                <Route path="/forgot-password" element={<OTPFlow />} />

                {/* Authenticated routes */}
                <Route element={<PrivateRoute />}>
                  <Route path="/refer-friend" element={<ReferPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/upgrade" element={<UpgradeToPremium />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/commision"
                    element={<CommissionNotifications />}
                  />
                  <Route path="/resources" element={<ResourceList />} />

                  <Route path="/reset-pin" element={<ResetPinForm />} />
                  <Route path="/reset-password" element={<ResetPasswordForm/>} />
                  
                  <Route path="/privacy" element={<PrivacyPage/>} />
                   <Route path="/help-center" element={<HelpCenterForm/>} />



                  <Route
                    path="/products/detailed/:slug"
                    element={<ProductDetails />}
                  />
                  <Route path="/notification" element={<Notification />} />
                  <Route path="/announcements" element={<UpdatePage />} />

                  <Route path="/Account" element={<AccountPage />} />
                  <Route path="Account/deposit" element={<DepositForm />} />
                  <Route path="Account/withdraw" element={<WithdrawalForm />} />
                  <Route path="Account/transfer" element={<TransferForm />} />
                  <Route path="Account/swap" element={<SwapForm />} />
                  <Route path="/premium" element={<PremiumPage />} />
                  <Route
                    path="/subscriptions"
                    element={<SubscriptionsPage />}
                  />
                  <Route path="/transaction" element={<TransactionList />} />

                  <Route path="/rates" element={<CurrencyConverter />} />

                  <Route path="/home" element={<Carsoul />} />
                  <Route path="/God" element={<AssemblyOfGods />} />
                  {/* Premium routes */}
                  <Route element={<PremiumRoute />}>
                    <Route path="/myteam" element={<Referalpage />} />
                  </Route>
                </Route>
              </Routes>
            </AnimatePresence>
          </AuthProvider>
        </div>
      </div>
    </>
  );
};

export default App;
