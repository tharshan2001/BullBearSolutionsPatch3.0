import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import AdminLogin from "./fragments/AdminLogin";
import PrivateRoute from "./fragments/PrivateRoute";
import AdminPanel from "./fragments/AdminPanel";
import ProductList from "./fragments/products/ProductList";
import SubscriptionsList from "./fragments/Subscription/SubscriptionsList";
import AnnouncementsList from "./fragments/annoncement/AnnouncementsList";
import { Toaster } from "react-hot-toast";
import ConfigList from "./fragments/config/ConfigList";
import ManageTransactions from "./fragments/Transaction/ManageTransactions";
import PremiumPlansTable from "./fragments/Premium/PremiumPlansTable";
import NetworkAddressesList from "./fragments/addresses/NetworkAddressesList";
import ResourcesTable from "./fragments/resource/ResourcesTable";
import HelpCenterMessages from "./fragments/helpcenter/HelpCenterMessages";
import AdminUserSearch from "./fragments/user/AdminUserSearch";
import AdminLayout from "./fragments/AdminLayout";

const App = () => {
  return (
    <AdminAuthProvider>
      {/* Toaster setup only */}
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

      <Routes>
        {/* Public */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Protected */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/" element={<Navigate to="/admin" replace />} />

          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/subscription" element={<SubscriptionsList />} />
          <Route path="/admin/announcement" element={<AnnouncementsList />} />
          <Route path="/admin/config" element={<ConfigList />} />
          <Route path="/admin/Transaction" element={<ManageTransactions />} />
          <Route path="/admin/wallet" element={<NetworkAddressesList/>} />
          <Route path="/admin/planTable" element={<PremiumPlansTable />} />
          <Route path="/admin/planTable" element={<PremiumPlansTable />} />
          <Route path="/admin/resource" element={<ResourcesTable/>} />
          <Route path="/admin/message" element={<HelpCenterMessages/>} />
          <Route path="/admin/user" element={<AdminUserSearch/>} />


          
        </Route>
      </Routes>
      <AdminLayout/>
    </AdminAuthProvider>
  );
};

export default App;
