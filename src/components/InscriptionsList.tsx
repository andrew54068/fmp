import { Box, Text, SimpleGrid } from '@chakra-ui/react';
import { Metadata } from 'src/types';
import InscriptionsCard from 'src/components/InscriptionCard';

interface InscriptionsListProps {
  inscriptionList: Metadata[];
}

export default function InscriptionsList({ inscriptionList }: InscriptionsListProps) {

  return (
    <Box>
      <Text fontSize="size.heading.3" mb="space.l">
        Your Inscriptions
      </Text>
      {inscriptionList.length > 0 && (
        <SimpleGrid columns={[1, null, 2]} spacing="space.l">
          {inscriptionList.map((inscriptionData, index) => (
            <InscriptionsCard inscriptionData={JSON.parse(inscriptionData.inscription)} key={index} />
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
