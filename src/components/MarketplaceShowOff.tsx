import { Tooltip, Box } from "@chakra-ui/react";

export function MarketplaceShowOff() {

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