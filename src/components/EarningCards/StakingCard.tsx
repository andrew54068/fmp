import {
  Card,
  Text,
  Box,
  Progress,
  Stack,
  Flex,
  Tag,
  useDisclosure
} from '@chakra-ui/react';
import BannerIcon from 'src/assets/fomopolyBanner.svg?react';
import StakingModal from './StakingModal';

export default function StakingCard() {
  const { isOpen: isModalOpen, onOpen: onOpenModal, onClose: onCloseModal } = useDisclosure();
  return (

    <Card
      maxW="sm"
      borderRadius="30px"
      overflow="hidden"
      p="24px"
      bg="slate.600"
      color="white"
      cursor="pointer"
      onClick={onOpenModal}>
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
          {/* <Circle/> */}
          <Tag
            fontSize="14px"
            fontWeight="400"
            bg="primary.dark"
            borderRadius="24px"
            color="neutral.900"
            mr="8px"
          >
            Stake
          </Tag>
          <Tag
            fontSize="14px"
            fontWeight="400"
            bg="transparent"
            borderRadius="24px"
            border="1px solid"
            borderColor="primary.dark"
            color="primary.dark"
          >
            <Box as="span" width="8px" height="8px" borderRadius="50%" bg="primary.dark" mr="4px" />

            Live
          </Tag>
        </Flex>

        <Flex justify="space-between" alignItems="center">
          <Text fontSize="sm">Token distributed</Text>
          <Text fontSize="sm">80%</Text>
        </Flex>
        <Progress value={80} size="sm" colorScheme="monopolyEarnProgress" my="12px" height="16px" borderRadius="24px" />

        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="sm">Stake FF to earn FMP</Text>
        </Flex>
      </Stack>
      <StakingModal isModalOpen={isModalOpen} onCloseModal={onCloseModal} />
    </Card >

  )
}
