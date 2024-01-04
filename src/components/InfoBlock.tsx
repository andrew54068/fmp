import { Text, Flex } from "@chakra-ui/react";

interface InfoBlockProp {
  statistic: string;
  desc: string;
}

export default function InfoBlock({ statistic, desc }: InfoBlockProp) {
  return (
    <Flex
      p="20px"
      w="50%"
      direction="column"
      borderRadius="md"
      alignItems="left"
      rowGap="0px"
      bg="#01ef8b"
    >
      <Text m="5px" fontSize="size.heading.3">
        {statistic}
      </Text>
      <Text m="5px" fontSize="size.body.3">
        {desc}
      </Text>
    </Flex>
  );
}
