import { Text, Flex } from "@chakra-ui/react";

interface InfoBlockProp {
  statistic: string;
  desc: string;
}

export default function InfoBlock({ statistic, desc }: InfoBlockProp) {
  return (
    <Flex
      p="space.s"
      w={["100%", "50%"]}
      direction="column"
      borderRadius="md"
      alignItems="left"
      rowGap="0px"
      bg="#01ef8b"
    >
      <Text
        m="5px"
        fontSize={window.innerWidth > 500 ? "size.heading.3" : "size.body.4"}
      >
        {statistic}
      </Text>
      <Text m="5px" fontSize={window.innerWidth > 500 ? "size.body.4" : "size.body.3"}>
        {desc}
      </Text>
    </Flex>
  );
}
