import { Button, Input, HStack, StackProps } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
interface StepInputProps {
  onChange?: (value: number) => void;
}


const MAX_PER_MINT = 500
const StepInput = ({ onChange, ...rest }: StepInputProps & StackProps) => {
  const [value, setValue] = useState(100);

  const increment = () => {
    if (value >= MAX_PER_MINT) return
    setValue((prev) => prev + 100)
  };
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