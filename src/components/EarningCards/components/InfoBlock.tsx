import { ReactElement, } from 'react'
import { Box, Text } from '@chakra-ui/react'

const InfoBlock = ({ label, children }: { label?: string, children: ReactElement | ReactElement[] }) => (
  <Box w="100%">
    {label && <Box
      minHeight="20px"
      display="inline-block"
      borderRadius="8px"
      px="8px"
      border="1px solid"
      borderColor="neutral.400"
      mb="8px">

      <Text fontSize="12px" color="neutral.50" >
        {label}
      </Text>
    </Box>}
    <Box
      border="1px solid"
      borderColor="neutral.400"
      borderRadius="10px"
      p="16px">
      {children}
    </Box>
  </Box>)


export default InfoBlock