import { Box, Text, Card, SimpleGrid } from '@chakra-ui/react';
import JsonDisplay from 'src/components/JsonDisplay';
import { Metadata } from 'src/types';

interface InscriptionsListProps {
  inscriptionList: Metadata[];
}

export default function InscriptionsList({ inscriptionList }: InscriptionsListProps) {
  console.log('inscriptionList :', inscriptionList);

  return (
    <Box>
      <Text fontSize="size.heading.3" mb="space.l">
        Your Inscriptions
      </Text>
      {inscriptionList.length > 0 && (
        <SimpleGrid columns={[1, null, 2]} spacing="space.l">
          {inscriptionList.map((inscriptionData, index) => (
            <Card p="16px" bg="gray.200" key={index}>
              {inscriptionData?.inscription && (
                <JsonDisplay data={JSON.parse(inscriptionData.inscription)} />
              )}
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
