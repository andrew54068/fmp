import { useState } from 'react';
import { Flex, Box, SimpleGrid } from '@chakra-ui/react';
import Button from 'src/components/Button'
import { InfoOutlineIcon } from '@chakra-ui/icons'
import InscriptionsCard from 'src/components/InscriptionCard';
import { ListingMetadata } from 'src/types';

const inscriptions = [
  {
    id: "924755000",
    inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
    uuid: "1418376316",
    price: "2"
  },
  {
    id: "924755000",
    inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
    uuid: "1418376376",
    price: "1.5"
  },
  {
    id: "924755000",
    inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
    uuid: "14183763122",
    price: "2"
  }, {
    id: "924755000",
    inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
    uuid: "14183763123",
    price: "3"
  },
  {
    id: "924755000",
    inscription: "{\"p\":\"frc-20\",\"op\":\"mint\",\"tick\":\"ff\",\"amt\":\"1000\"}",
    uuid: "14183763125",
    price: "3"
  }
]

export default function ListingPanel() {
  const [isBuying, setIsBuying] = useState(false);
  const [selectedInscriptions, setSelectedInscriptions] = useState<string[] | null>([]);
  const [priceSummary, setPriceSummary] = useState(0);
  const hasSelected = selectedInscriptions?.length ?? 0 > 0;

  const handleBuyClick = () => {
    setIsBuying(!isBuying);
    if (isBuying) {
      // Reset selection when canceling
      setSelectedInscriptions([])
    }
  };

  const handleCardSelect = (inscription: ListingMetadata) => {
    if (!isBuying) return;
    if (!selectedInscriptions?.includes(inscription.uuid)) {
      setSelectedInscriptions((prev) => [
        ... (prev || []),
        inscription.uuid]);
      // Add price to summary
      if (inscription?.price) {
        setPriceSummary((prev) => prev + parseFloat(inscription?.price || ''));
      }
    } else {
      setSelectedInscriptions(
        (prev) => (prev || [])?.filter((uuid) => uuid !== inscription.uuid));
      // Remove price from summary
      if (inscription?.price) {
        setPriceSummary((prev) => prev - parseFloat(inscription?.price || ''));
      }
    }
  };

  const handleCancel = () => {
    setIsBuying(false);
    setSelectedInscriptions([]);
    setPriceSummary(0);
  };

  const handleSendTransaction = () => {
    //@todo add transaction logic 
  }

  const CallToActionButton = () => {
    if (!isBuying) {
      return <Button
        colorScheme="blue"
        onClick={handleBuyClick}
        width={["100%", "auto"]}
        ml="auto"
        display="inline-block" minW="200px">
        Buy
      </Button>
    }
    if (hasSelected) {
      return <Box w={["100%", "auto"]}>
        <Button
          colorScheme="blue"
          onClick={handleSendTransaction}
          width={["100%", "auto"]}
          bg="#01ef8b"
          _hover={{
            bg: "#01ef8b",
            transform: "scale(0.98)"
          }}
        >
          Buy {selectedInscriptions?.length} Items
        </Button>
        <Button
          ml={["0", 'space.m']}
          mt={["space.s", "0"]}
          colorScheme="blue"
          onClick={handleCancel}
          width={["100%", "auto"]}
        >
          Cancel
        </Button></Box >
    }

    return <Button
      ml="space.m"
      colorScheme="blue"
      onClick={handleCancel}
      width={["100%", "auto"]}
    >
      Cancel
    </Button>

  }

  return (
    <Box p="16px">
      <SimpleGrid columns={[1, 2, 3, 4]} spacing="space.l">
        {inscriptions.map((inscription, index) => (

          <Box>
            <InscriptionsCard
              key={index}
              inscriptionData={JSON.parse(inscription.inscription)}
              selectable={isBuying}
              isSelected={selectedInscriptions?.includes(inscription.uuid)}
              onClick={() => handleCardSelect(inscription)}
              price={inscription.price}
              {...isBuying && { cursor: "pointer" }}
            />

          </Box>
        ))}
      </SimpleGrid>

      <Box pos="fixed"
        bottom="0"
        left="0"
        right="0"
        width="100%"
        bg="gray.800"
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          p="space.m"
          maxWidth="820px"
          margin="0 auto"
          flexDirection={["column", "column", "row"]}>
          {
            isBuying && <Box mb={["16px", "16px", "0"]}>
              <Flex fontSize="size.body.2" mb="space.2xs" color="gray.400" alignItems="center">
                <InfoOutlineIcon />
                <Box ml="space.3xs">
                  You can buy up to 50 items at a time.
                </Box>
              </Flex>
              {
                <Box fontSize="size.body.1">
                  You are buying {selectedInscriptions?.length} items for {priceSummary} Flow
                </Box>
              }
            </Box>
          }
          <CallToActionButton />
        </Flex>
      </Box>
    </Box >
  );
}
