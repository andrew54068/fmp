import { Button, Input, HStack, StackProps } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
interface StepInputProps {
  onChange?: (value: number) => void;
}


const StepInput = ({ onChange, ...rest }: StepInputProps & StackProps) => {
  const [value, setValue] = useState(0);

  const increment = () => setValue((prev) => prev + 100);
  const decrement = () => setValue((prev) => prev - 100);

  useEffect(() => {
    onChange?.(value);
  }, [onChange, value]);

  return (
    <HStack {...rest}>
      <Button onClick={decrement}>-</Button>
      <Input value={value} readOnly />
      <Button onClick={increment}>+</Button>
    </HStack>
  );
}

export default StepInput 