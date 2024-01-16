import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button as ChakraButton,
  Box,
  VStack,
  HStack,
  Image,
  Flex
} from '@chakra-ui/react';
import Button from 'src/components/Button';
import ModalBanner from 'src/assets/fomopolyModalBanner.png';
import TokenInput from './TokenInput';
import InfoBlock from './InfoBlock';


interface ModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onClickStake: () => void;
}


const StakingModal = ({ isModalOpen, onCloseModal, onClickStake }: ModalProps) => {
  const [ffAmount, setFfAmount] = useState('');
  const [loadingForFlowAmount, setLoadingForFlowAmount] = useState(false);
  const [flowAmountNeeded, setFlowAmountNeeded] = useState('');


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFfAmount(event.target.value);
    console.log('event.target.value :', event.target.value);
    setLoadingForFlowAmount(true)
    // @todo: api logic for flow amount
    setTimeout(() => {
      setLoadingForFlowAmount(false)
      // if()
      setFlowAmountNeeded(prev => `${Number(prev) + 1}`)
    }, 1000)
  };
  return (
    <>
      <Modal isOpen={isModalOpen} onClose={onCloseModal}  >
        <ModalOverlay />
        <ModalContent
          bgColor="slate.600"
          borderRadius="30px"
          padding="24px"
          maxWidth="591px"
          width="100%"
          minHeight="709px"
          mt="24px"
          mx="16px"
        >
          <Box
            position="relative"
            paddingBottom="30%"
            mb="30px">
            <Box
              position="absolute"
              top="50%"
              left="50%"
              overflow="hidden"
              transform="translate(-50%,-50%)"
              w="100%">
              <Image src={ModalBanner} width="100%" />
            </Box>
          </Box>

          <ModalBody overflow="scroll" >
            <VStack spacing="30px" >
              <Flex
                width="100%"
                justifyContent="space-between"
                flexDirection={["column", "row"]}
                gap="16px">
                <TokenInput
                  label="Stake"
                  tokenName="$FF"
                  value={ffAmount}
                  onChange={handleChange}
                  balance={0.189}
                />
                <TokenInput
                  isLoading={loadingForFlowAmount}
                  label="Paying"
                  tokenName="$Flow"
                  value={flowAmountNeeded}
                  balance={0.189}
                  borderColor='neutral.700'
                />
              </Flex>
              {/* // Detail  */}

              <InfoBlock label="Detail">
                <HStack justifyContent="space-between" mb="12px">
                  <Box>
                    Paying
                  </Box>
                  <Box>
                    {`${flowAmountNeeded || 0.00} $Flow`}
                  </Box>
                </HStack>
                <HStack justifyContent="space-between" mb="12px">
                  <Box>
                    Staking
                  </Box>
                  <Box>
                    {`${ffAmount || 0.00} $FF`}
                  </Box>
                </HStack>
                <HStack justifyContent="space-between">
                  <Box>
                    Pool Share
                  </Box>
                  <Box>
                    0.0 $FF
                  </Box>
                </HStack>
              </InfoBlock>

              <InfoBlock label="Earned">
                <HStack justifyContent="space-between">
                  <Box>
                    Amount
                  </Box>
                  <Box
                    borderRadius="8px"
                    border="1px solid"
                    borderColor="primary"
                    p="4px 8px">
                    0.0 <Box as="span" color="primary"> $FMP </Box>
                  </Box>
                </HStack>
              </InfoBlock>
            </VStack>
          </ModalBody>

          <ModalFooter boxShadow="  ">
            <HStack
              width="full"
              justifyContent="space-between"
              flexDirection={["column-reverse", "row"]}
              gap="16px">
              <ChakraButton
                width={["100%"]}
                color="neutral.50"
                border="1px solid"
                borderColor="neutral.50"

                variant="outline" onClick={onCloseModal}>Cancel</ChakraButton>
              <Button minW={[0, "65%", "370px"]} width={["100%", "370px"]}
                onClick={onClickStake}
              >Stake for $FMP</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal >
    </>
  );
};

export default StakingModal;
