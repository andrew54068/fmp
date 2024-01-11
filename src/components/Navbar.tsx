import { useEffect, useContext } from "react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useMediaQuery } from "@chakra-ui/react";
import { GlobalContext } from "src/context/global";
import { Box, ListItem as ChakraListItem, Collapse, Flex, IconButton, List } from "@chakra-ui/react";
import Button from "src/components/Button";
import Logo from "src/assets/Logo.svg?react";
import useClickAway from "src/hooks/useClickAway";
import { useState } from "react";
import * as fcl from "@blocto/fcl";
import { Link } from "react-router-dom";
import formatAddress from "src/utils/formatAddress";

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
  const [isMobile] = useMediaQuery("(max-width: 768px)");
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
      bg="background.primary"
      boxShadow="0 0 10px 0 rgba(0, 0, 0, 0.05)"
    >
      <Flex justify="space-between" alignItems="center" width="100%">
        <Box fontSize="size.heading.4" pl="space.l" >
          <Link to="/mint">
            <Logo />
          </Link>
        </Box>
        <Box>
          <Link to="/autoSweep">
            <Box position="absolute" color="orange" top="10px" ml="-10px">
              New
            </Box>
            AutoSweep
          </Link>
        </Box>

        {
          isMobile ? <Flex alignItems="center">
            <IconButton color="white" onClick={toggleDropdown} aria-label="menu-button" icon={<HamburgerIcon />} variant="outline" />
          </Flex> : <Flex alignItems="center">
            {
              !account ? <Button onClick={onClickConnect} >
                Connect Wallet
              </Button> : <Box>
                {formatAddress(account)}
              </Box>
            }
          </Flex>
        }
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
            <Link to="/marketplace">
              <ListItem>
                Marketplace
              </ListItem>
            </Link>

            <ListItem onClick={onClickConnect}>
              <Flex alignItems="center" justify="space-between">
                <Box as="span">
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
