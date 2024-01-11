import { Route, Routes, useLocation } from "react-router-dom";
import theme from "./theme";
import { useEffect } from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import Mint from "src/components/Mint";
import "src/services/fcl"
import NotFound from "src/components/NotFound";
import Marketplace from "src/components/Marketplace";
import { initAmplitude } from "./services/Amplitude"
import { logPageView } from "./services/Amplitude/log"
import { GlobalProvider } from "./context/globalContextProvider";
import AutoSweepBot from "./components/AutoSweepBot";

initAmplitude()
const maxWidthSetting = {
  "/": "100%",
  "/mint": "520px",
  "/marketplace": "1020px"
}

function App() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  useEffect(() => {

    logPageView(pathname)
    if (isLanding) {
      window.location.href = "/mint";
    }
  }, [isLanding, pathname]);

  return (
    <GlobalProvider>
      <ChakraProvider theme={theme}>
        <Box margin="0 auto" width="100%" bg="#1F2937" >
          <Navbar />
          <Box margin="0 auto" maxW={maxWidthSetting[pathname]} >
            <Routes>
              <Route path="/" element={<Box>  </Box>} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/autoSweep" element={<AutoSweepBot />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Box>
      </ChakraProvider>
    </GlobalProvider>
  );
}

export default App;
