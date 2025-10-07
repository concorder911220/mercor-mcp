import { ThemeProvider } from "@mui/material/styles";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { theme } from "./theme";
import "./App.css";
import { MainLayout } from "./layouts/MainLayout";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Agents from "./pages/Agents";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Clients from "./pages/Clients";
import TaxDocuments from "./pages/TaxFiling";
import TaxDocumentsV2 from "./pages/TaxDocumentsV2";
import TaxDocumentReview from "./pages/TaxDocumentReview";
import ClientProfile from "./pages/ClientProfile";
import ClientOnboarding from "./pages/ClientOnboarding";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { TaskProvider } from "./context/TaskContext";
import { TaskLayout } from "./layouts/TaskLayout";
import Planning from "./pages/Planning";
import Conversation from "./pages/Conversation";
import { OAuthCallback } from "./components/OAuthCallback";

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <TaskProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/auth/:provider/callback" element={<OAuthCallback />} />
                <Route element={<PrivateRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/tax" element={<Clients />} />
                    <Route path="/tax/filing-001" element={<TaxDocumentsV2 />} /> // Hardcoded to render for Sara Randall
                    <Route path="/tax/:filingId" element={<TaxDocuments />} />
                    <Route path="/tax/:filingId/profile" element={<ClientProfile />} />
                    <Route path="/tax/:filingId/documents" element={<TaxDocuments />} />
                    <Route path="/tax/:filingId/review/:docId" element={<TaxDocumentReview />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/agents" element={<Agents />} />
                    <Route path="/profile" element={<Profile />} />
                    {/* Tax workflow routes */}
                    <Route path="/clients/:clientId/profile" element={<ClientProfile />} />
                    <Route path="/clients/:clientId/documents" element={<TaxDocuments />} />
                    <Route path="/clients/:clientId/review/:docId" element={<TaxDocumentReview />} />
                    {/* Client onboarding route */}
                    <Route path="/onboarding/:clientName" element={<ClientOnboarding />} />
                  </Route>
                  <Route element={<TaskLayout />}>
                    <Route path="/" element={<Planning />} />
                    <Route path="/task/:conversationId" element={<Conversation />} />
                    <Route path="/conversation/:conversationId" element={<Conversation />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </TaskProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
