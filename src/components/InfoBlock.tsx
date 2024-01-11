import { Text, Flex } from "@chakra-ui/react";

interface InfoBlockProp {
  statistic: string;
  desc: string;
}

export default function InfoBlock({ statistic, desc }: InfoBlockProp) {
  return (
    <Flex
      p={['space.m', 'space.3xl']}
      w={["100%", "100%", "33.333333%"]}
      direction="column"
      borderRadius="md"
      alignItems="left"
      rowGap="0px"
      border="1px solid"
      borderColor="primary"
      color="primary"
    >
      <Text
        mb="4px"
        fontWeight="500"
        letterSpacing="-0.56px"
        lineHeight="36px"
        fontSize="size.heading.2"
      >
        {statistic}
      </Text>
      <Text
        fontWeight="400"
        lineHeight="18px"
        fontSize="size.heading.5"
      >
        {desc}
      </Text>
    </Flex >
  );
}
