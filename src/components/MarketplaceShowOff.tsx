import { Tooltip, Text, Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export function MarketplaceShowOff() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const hideTooltip = () => setShowTooltip(false);
    document.addEventListener("click", hideTooltip);

    return () => {
      document.removeEventListener("click", hideTooltip);
    };
  }, []);


  return (
    <Tooltip bg='gray.300' color="gray.600" label={<Box padding="4px">Coming Soon</Box>}
      onClick={(e) => e.stopPropagation()} pos="relative">
      <Box padding="space.m" cursor="pointer">
        Marketplace
      </Box>

    </Tooltip>
  );
}

export default MarketplaceShowOff;