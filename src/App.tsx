import { Route, Routes, useLocation, redirect } from "react-router-dom";
import theme from "./theme";
import { useEffect } from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import Mint from "src/components/Mint";
import "src/services/fcl"
import NotFound from "src/components/NotFound";
import { GlobalProvider } from "./context/globalContextProvider";

function App() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  useEffect(() => {
    if (isLanding) {
      window.location.href = "/mint";
    }
  }, [isLanding, pathname]);

  return (
    <GlobalProvider>
      <ChakraProvider theme={theme}>
        <Box margin="0 auto" width="100%" bg="gray.700" >
          <Navbar />
          <Box margin="0 auto" maxW={isLanding ? "100%" : `520px`} >
            <Routes>
              <Route path="/" element={<Box>  </Box>} />
              <Route path="/mint" element={<Mint />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Box>
      </ChakraProvider>
    </GlobalProvider>
  );
}

export default App;
