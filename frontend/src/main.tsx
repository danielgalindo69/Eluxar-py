
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./styles/index.css";
  import { GoogleOAuthProvider } from "@react-oauth/google";

  // Replace with your actual Google OAuth2 Client ID from Google Cloud Console
  const GOOGLE_CLIENT_ID = "877809143352-hlktop246hmcd0bj3s3vvjoobek002e9.apps.googleusercontent.com";

  createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  );
  