import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { Toaster } from "react-hot-toast";
import { AuthContextProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <>
    <ChakraProvider>
      <BrowserRouter>
        <AuthContextProvider>
          <App />
        </AuthContextProvider>
      </BrowserRouter>
    </ChakraProvider>
    <Toaster
    />
  </>
);
