import { RouterProvider } from "react-router";
import { router } from "./core/router/routes";
import { AuthProvider } from "./features/auth/context/AuthContext"
import { CartProvider } from "./features/cart/context/CartContext";
import { Toaster } from "sonner";
import { ThemeProvider } from "./core/context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                borderRadius: '0',
                border: '1px solid #EDEDED',
              },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
