import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const monopolyEarn = defineStyle({
  // border: '1px solid', // change the appearance of the border
  // borderRadius: "50%"
})

export const progressTheme = defineStyleConfig({
  variants: { monopolyEarn },
})