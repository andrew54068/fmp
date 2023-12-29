import { Box, Button } from "@chakra-ui/react";

export function MarketplaceShowOff() {
  const openInNewTab = (url) => {
    window.open(url, "_blank");
  };
  return (
    <Button
      variant="plain"
      color="white"
      onClick={() =>
        openInNewTab("https://bay.blocto.app/collection/inscription")
      }
    >
      <Box position="absolute" color="orange" top="-2px" left="-5px">
        New
      </Box>
      <Box padding="space.m" cursor="pointer">
        Marketplace
      </Box>
    </Button>
  );
}

export default MarketplaceShowOff;
