import { Progress as ChakraProgress, Box } from '@chakra-ui/react';
import { useState, useEffect } from 'react';

interface ProgressProps {
  progressData: string[],
  isLoading: boolean
}


export default function Progress({ progressData, isLoading }: ProgressProps) {
  const [currentAmount, setCurrentAmount] = useState(0)
  const [totalSupply, setTotalSupply] = useState(0)

  useEffect(() => {
    setCurrentAmount(Number(progressData?.[0]) || 0)
    setTotalSupply(Number(progressData?.[1]) || 0)
  }, [progressData])

  return <Box mb="space.l" fontSize="size.body.2">
    <Box mr="space.m" as="span">Total minted:</Box>
    {currentAmount} / {totalSupply}
    <ChakraProgress
      mt="space.xs"
      size='xs'
      isIndeterminate={isLoading}
      value={1 + Number(currentAmount) / Number(totalSupply)} />
  </Box>
}