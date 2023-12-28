import { Card, CardProps, Box, Icon } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import JsonDisplay from 'src/components/JsonDisplay';
import { Metadata } from 'src/types';

interface InscriptionCardProps extends CardProps {
  inscriptionData: Metadata;
  selectable?: boolean;
  isSelected?: boolean;
  price?: string;
}

export default function InscriptionsCard({ inscriptionData, selectable, price, isSelected, ...rest }: InscriptionCardProps) {

  const handleCardClick = () => {

  };

  return (
    <Card
      p="16px"
      pb="0px"
      bg="gray.200"
      border={selectable && isSelected ? '3px solid' : 'none'}
      borderColor={selectable && isSelected ? '#01ef8b' : 'transparent'}
      position="relative"
      overflow="hidden"
      onClick={handleCardClick}

      {...rest}
    >
      {selectable && isSelected && (
        <Box position="absolute" top="4px" right="4px" p="12px" borderRadius="100px" bg="#01ef8b">
          <Icon as={CheckIcon} color="white" w={3} h={3} pos="absolute" left="50%" top="50%" transform="translate(-50%,-50%)" />
        </Box>
      )}
      {inscriptionData && <JsonDisplay data={inscriptionData} />}
      {price && <Box
        borderTop="solid 1px"
        borderColor={isSelected ? '#01ef8b' : 'gray.800'}
        bg="gray.200"
        mt="space.m"
        mx="-16px"
        p="10px 16px"
        color="gray.600"
        fontSize="size.heading.4"
        fontWeight="semibold"
        textAlign="right">{price} Flow</Box>}
    </Card>
  );
}
