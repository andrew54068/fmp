import {
  Card,
  Text,
  Box,
  Progress,
  Stack,
  Flex,
  Tag
} from '@chakra-ui/react';
import BannerIcon from 'src/assets/freeflowBanner.svg?react';

export default function FFCard() {
  return (

    <Card maxW="sm" borderRadius="30px" overflow="hidden" p="24px" bg="#475569" color="white" cursor="not-allowed">
      <Box
        position="relative"
        aspectRatio={3.41 / 1.43}
        paddingBottom="42%"
        alignItems="center"
        mb={4}
        h="0">
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%,-50%)" w="100%">
          <BannerIcon width="100%" />
        </Box>
      </Box>

      <Stack gap="0">
        <Flex alignItems="center" mb="24px">
          <Tag
            fontSize="14px"
            fontWeight="400"
            bg="primary.dark"
            borderRadius="24px"
            color="neutral.900"
            mr="8px"
          >
            Mint
          </Tag>
          <Tag
            fontSize="14px"
            fontWeight="400"
            bg="transparent"
            borderRadius="24px"
            border="1px solid"
            borderColor="neutral.400"
            color="neutral.400"
          >
            <Box as="span" width="8px" height="8px" borderRadius="50%" bg="neutral.400" mr="4px" />
            Ended
          </Tag>
        </Flex>

        <Flex justify="space-between" alignItems="center">
          <Text fontSize="sm">Token distributed</Text>
          <Text fontSize="sm">100%</Text>
        </Flex>
        <Progress value={100} size="sm" colorScheme="monopolyEarnProgress" my="12px" height="16px" borderRadius="24px" />

        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="sm">Mint FF inscription</Text>
        </Flex>
      </Stack>
    </Card >

  )
}
