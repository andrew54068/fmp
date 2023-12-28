import { useState } from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';
import Button from 'src/components/Button'
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
  console.log('selectedInscriptions :', selectedInscriptions);
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
    } else {
      setSelectedInscriptions(
        (prev) => (prev || [])?.filter((uuid) => uuid !== inscription.uuid));
    }

  };

  return (
    <Box p="16px">
      <SimpleGrid columns={[1, null, 3, 4]} spacing="space.l">
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

      <Box pos="fixed" bottom="0" left="0" right="0" p="space.m" maxWidth="820px" margin="0 auto">
        <Button colorScheme="blue" onClick={handleBuyClick} display="inline-block">
          {isBuying ? (hasSelected ? "Send The Transaction" : "Cancel") : "Buy"}
        </Button>
      </Box>
    </Box>
  );
}
