import { useEffect, useContext } from "react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { GlobalContext } from "src/context/global";
import { Box, ListItem as ChakraListItem, Collapse, Flex, IconButton, List } from "@chakra-ui/react";
import Button from "src/components/Button";
import useClickAway from "src/hooks/useClickAway";
import { useState } from "react";
import * as fcl from "@blocto/fcl";
import { Link } from "react-router-dom";
import formatAddress from "src/utils/formatAddress";
import MarketplaceShowOff from './MarketplaceShowOff';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ListItem = ({ children, ...rest }: any) => (
  <ChakraListItem
    d="flex"
    alignItems="center"
    px={4}
    py="14px"
    cursor="pointer"
    transition=".2s all"
    _hover={{
      bg: "gray.200",
      color: "gray.800",
      "& button": {
        color: "gray.800",
        _hover: {
          color: "white",
        },
      }
    }}
    {...rest}
  >
    <Box mx={2} width="100%">
      {children}
    </Box>
  </ChakraListItem>
);

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { account, setAccount } = useContext(GlobalContext)

  const disconnect = () => {
    fcl.unauthenticate()
    setAccount("")
  };

  useEffect(
    () => {
      fcl.currentUser().subscribe((user) => {
        setAccount(user?.addr)
      })
      return () => { }
    },
    [setAccount]
  );


  const ref = useClickAway(() => setShowDropdown(false));
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const onClickCopyAccount = () => {
    navigator.clipboard.writeText(account || "");
  };

  const onClickConnect = async () => {
    await fcl.authenticate();
  };

  return (
    <Flex
      ref={ref}
      top="0"
      h="75px"
      p="space.s"
      zIndex="banner"
      position="fixed"
      width="100%"
      bg="gray.800"
      boxShadow="0 0 10px 0 rgba(0, 0, 0, 0.05)"
    >
      <Flex justify="space-between" alignItems="center" width="100%">
        <Box fontSize="size.heading.4" pl="space.l" >
          <Link to="/mint">
            Freeflow
          </Link>
        </Box>
        <Flex flex="1" justifyContent="flex-end">
          <MarketplaceShowOff />
        </Flex>
        <Flex alignItems="center">
          <IconButton color="white" onClick={toggleDropdown} aria-label="menu-button" icon={<HamburgerIcon />} variant="outline" />
        </Flex>
      </Flex>
      {/* Dropdown menu on mobile */}
      <Collapse
        in={showDropdown}
        style={{
          position: "absolute",
          top: "75px",
          left: 0,
          width: "100%",
          zIndex: 1400,
          background: "gray.800",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Box
          py="space.s"
          zIndex="overlay"
          background="gray.800"
          onClick={() => setShowDropdown(false)}
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.05)"
        >
          <List fontWeight={500}>
            <ListItem onClick={onClickConnect}>
              <Flex alignItems="center" justify="space-between">
                <Box as="span" ml="space.s">
                  {account ? `${formatAddress(account)} ` : "Connect Wallet"}
                </Box>
                {account && (
                  <Button color="white" onClick={onClickCopyAccount} w="auto" variant="outlineDark" >
                    Copy Address
                  </Button>
                )}
              </Flex>
            </ListItem>

            {account && (
              <ListItem onClick={disconnect}>
                <Flex alignItems="center">
                  <Box as="span" ml="space.s">
                    Disconnect
                  </Box>
                </Flex>
              </ListItem>
            )}
          </List>
        </Box>
      </Collapse>
    </Flex >
  );
}
