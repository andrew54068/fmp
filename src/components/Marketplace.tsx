import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import InscriptionsList from 'src/components/InscriptionsList';

const fakeInscription = {
  id: "924755000",
  inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
  uuid: "1418376316"
}

export default function Marketplace() {
  return <Box bg="gray.700" mt="75px" minH="calc(100vh - 75px)" padding="16px" >
    <Tabs colorScheme="whiteAlpha" variant="marketplace">
      <TabList>
        <Tab>
          Listing
        </Tab>
        <Tab>My Items</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <InscriptionsList inscriptionList={[fakeInscription, fakeInscription]} />
        </TabPanel>
        <TabPanel>
          <p>two!</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Box >
}
