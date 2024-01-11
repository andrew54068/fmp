import { Flex, Box, ButtonProps, Button as ChakraButton, Spinner } from "@chakra-ui/react";
import { MouseEventHandler, forwardRef } from "react";


interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
  showRing?: boolean;
}

const Button = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, isLoading, onClick, ...rest }, ref) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (!isLoading && onClick) {
        onClick(event);
      }
    };

    return (
      <ChakraButton
        ref={ref}
        variant="primary"
        onClick={handleClick}
        cursor={isLoading ? "not-allowed" : "pointer"}
        boxShadow="0px 0px 20px 0px rgba(35, 37, 40, 0.05)"
        {...rest}
      >
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          <Box as="span" w="100%">{isLoading ? <Spinner size="sm" /> : children}</Box>
        </Flex>
      </ChakraButton>
    );
  }
);

export default Button;
