import { Card, CardProps, Box, Icon } from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import JsonDisplay from 'src/components/JsonDisplay';
import { Metadata } from 'src/types';
import BigNumber from 'bignumber.js';

interface InscriptionCardProps extends CardProps {
  inscriptionData: Metadata;
  selectable?: boolean;
  isSelected?: boolean;
  price?: BigNumber | null;
}

export default function InscriptionsCard({ inscriptionData, selectable, price, isSelected, ...rest }: InscriptionCardProps) {

  BigNumber.config({ DECIMAL_PLACES: 2, CRYPTO: true });

  return (
    <Card
      p="16px"
      pb="0px"
      bg="gray.200"
      border={selectable && isSelected ? '3px solid' : 'none'}
      borderColor={selectable && isSelected ? '#01ef8b' : 'transparent'}
      position="relative"
      overflow="hidden"

      {...rest}
    >
      {selectable && isSelected && (
        <Box position="absolute" top="4px" right="4px" p="12px" borderRadius="100px" bg="#01ef8b">
          <Icon as={CheckIcon} color="white" w={3} h={3} pos="absolute" left="50%" top="50%" transform="translate(-50%,-50%)" />
        </Box>
      )}
      {inscriptionData && <JsonDisplay data={inscriptionData} />}
      
      <Box
        borderTop="solid 1px"
        borderColor={isSelected ? '#01ef8b' : 'gray.800'}
        bg="gray.200"
        mt="space.m"
        mx="-16px"
        p="10px 16px"
        color="gray.600"
        fontSize="size.heading.4"
        fontWeight="semibold"
        textAlign="right">{price ? (price.toString() + ' Flow'): 'Not listed'} </Box>
    </Card>
  );
}
