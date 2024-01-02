import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import ListingPanel from 'src/components/ListingPanel';
import PersonalPanel from './PersonalPanel';


export default function Marketplace() {
  return <Box bg="gray.700" mt="75px" minH="calc(100vh - 75px)" padding="16px" pb="172px" pt="60px" >
    <Tabs colorScheme="whiteAlpha" variant="marketplace">
      <TabList>
        <Tab>
          Listing
        </Tab>
        <Tab>My Items</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <ListingPanel />
        </TabPanel>
        <TabPanel>
          <PersonalPanel />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box >
}
