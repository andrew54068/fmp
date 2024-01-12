import { SimpleGrid, Box, Text } from '@chakra-ui/react'

import StakingCard from './EarningCards/StakingCard'

export default function FomopolyEarn() {
  return (
    <Box
      mt="75px"
      minH="calc(100vh - 75px)"
      padding="16px"
      pb="space.5xl"
      pt={["40px", "120px"]}
      px={["16px", "40px", "112px"]}
    >
      <Text
        fontSize="48px"
        fontWeight="600"
        lineHeight="48px"
        fontFamily="panchang"
        letterSpacing="-0.96px"
        mb="52px">
        Explore the tokens
        in <br /> <Box as="span" color="primary" >FreeFlow</Box> ecosystem
      </Text>
      {/* // use Grid to make 3 column layout */}
      <SimpleGrid columns={[1, 2, 3]} spacing='24px'>
        <Box height='80px'>
          <StakingCard />
        </Box>
        <Box height='80px'></Box>
        <Box height='80px'></Box>
      </SimpleGrid>
    </Box >
  )
}