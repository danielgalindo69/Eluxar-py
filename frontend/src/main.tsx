
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./styles/index.css";
  import { GoogleOAuthProvider } from "@react-oauth/google";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

  // Replace with your actual Google OAuth2 Client ID from Google Cloud Console
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const queryClient = new QueryClient();

  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
  