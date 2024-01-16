import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Image
} from '@chakra-ui/react';
import ModalBanner from 'src/assets/fomopolyModalBanner.png';

interface ModalProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
}

const StakingModal = ({ isModalOpen, onCloseModal }: ModalProps) => {

  return (
    <>

      <Modal isOpen={isModalOpen} onClose={onCloseModal} isCentered>
        <ModalOverlay />
        <ModalContent
          bgColor="slate.600"
          borderRadius="30px"
          padding="24px"
          maxWidth="591px"
          width="100%"
          maxHeight="709px"
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

          <ModalBody>
            <VStack spacing="5">
              <HStack w="full" justifyContent="space-between">
                <FormControl id="stake">
                  <FormLabel>Stake</FormLabel>
                  <Input placeholder="0.00" />
                </FormControl>
                <FormControl id="paying">
                  <FormLabel>Paying</FormLabel>
                  <Input placeholder="0.00" />
                </FormControl>
              </HStack>
              {/* Other content goes here */}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack width="full" justifyContent="space-between">
              <Button variant="outline" onClick={onCloseModal}>Cancel</Button>
              <Button colorScheme="blue">Stake for FMP</Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal >
    </>
  );
};

export default StakingModal;
