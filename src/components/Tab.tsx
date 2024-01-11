import React, { Ref } from 'react'
import { Flex, useTab, Button, Box } from "@chakra-ui/react"

interface Props {
  children: React.ReactNode
}
const CustomTab = React.forwardRef((props: Props, ref: Ref<HTMLElement>) => {
  // 1. Reuse the `useTab` hook
  const tabProps = useTab({ ...props, ref })
  const isSelected = !!tabProps['aria-selected']

  // 2. Hook into the Tabs `size`, `variant`, props
  // @todo: use style in the theme settings.
  // const styles = useMultiStyleConfig('Tabs', tabProps)

  return (
    <Button
      {...tabProps}
      pr="5px"
      color="black"
      borderRadius="10px"
      fontWeight="500"
      border={isSelected ? "2px solid #00F6F7" : "none"}
      _focus={{
        border: isSelected ? "2px solid #00F6F7" : "none"
      }}
    >
      <Flex alignItems="center">
        {
          isSelected ? <Box as="span"
            borderRadius="4px"
            width="16px"
            height="16px"
            bg="primary"
          /> : <Box as="span"
            borderRadius="4px"
            width="16px"
            height="16px"
            bg="gray.300"
          />
        }
        {props.children}
      </Flex>
    </Button >
  )
})

export default CustomTab
