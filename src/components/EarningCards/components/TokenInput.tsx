import React from 'react';
import { Spinner, InputGroup, InputRightElement, Box, Text, Input, Stack } from '@chakra-ui/react';

interface TokenInputProps {
  tokenName: string;
  balance: number;
  value: string;
  label?: string;
  borderColor?: string;
  isLoading?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({
  borderColor = "neutral.400",
  label,
  tokenName,
  balance,
  value,
  onChange,
  isLoading }) => {
  return (
    <Box w="100%">
      {<Box
        minHeight="20px"
        display="inline-block"
        borderRadius="8px"
        px="8px"
        border={label ? "1px solid" : "none"}
        borderColor="#9CA3AF"
        mb="8px">
        {
          label && <Text fontSize="12px" color="neutral.50" >
            {label}
          </Text>
        }
      </Box>}
      <Box border="1px solid" borderColor={borderColor} borderRadius="10px" p="16px 24px"
        minW="215px"
      >
        <InputGroup mb="4px">
          <InputRightElement right="24px" pointerEvents="none" children={<Text

            color="primary"
            fontSize={["18px", "24px"]}
            fontWeight={[400, 500]}
            lineHeight="32px"
            letterSpacing="-0.48px">{tokenName}</Text>} />
          {
            !isLoading ? <Input
              placeholder="0.00"
              value={value}
              onChange={onChange}
              readOnly={!onChange}
              fontSize="24px"
              fontWeight={500}
              lineHeight="32px"
              letterSpacing="-0.48px"
              border="none"
              pl="0"
              pr="7rem"
              color="white"
              _placeholder={{ color: 'neutral.400' }}
              _focus={{ boxShadow: 'none' }}
            /> : <Box
              pr="7rem"
              minH="40px"
              display="inline-block">
              <Spinner color="neutral.400" />
            </Box>
          }
        </InputGroup>
        <Text fontSize="sm" color="white" pl="0">
          Balance: {balance.toFixed(3)}
        </Text>
      </Box>
    </Box>
  );
};

export default TokenInput;
