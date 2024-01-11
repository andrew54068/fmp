import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools' // import utility to set light and dark mode props

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const marketplaceVariant = definePartsStyle((props) => {
  return {
    tab: {
      border: '2px solid',
      color: 'black',
      borderColor: 'transparent',
      bg: 'transparent',
      borderTopRadius: 'md',
      borderBottom: 'none',
      _selected: {
        color: 'black',
        bg: mode('#fff', 'gray.800')(props),
        borderBottom: 'none',
        mb: '-2px',
      },
      _focus: {
        border: '2px solid black',
        outline: 'none',
        outlineWidth: '0',
        boxShadow: 'none',
      },
      _active: {
        border: '2px solid black',
        outline: 'none',
        outlineWidth: '0',
        boxShadow: 'none',
      },
      _focusVisible: {
        border: '2px solid black',
        outline: 'none',
        outlineWidth: '0',
        boxShadow: 'none',
      },
      _focusWithin: {
        border: '2px solid black',
        outline: 'none',
        outlineWidth: '0',
        boxShadow: 'none',
      }

    },
    tablist: {
      borderBottom: '2x solid',
      borderColor: 'inherit',
    },
    tabpanel: {
      border: '2px solid',
      borderColor: 'inherit',
      borderBottomRadius: 'lg',
      borderTopRightRadius: 'lg',
    },
  }
})

const variants = {
  marketplace: marketplaceVariant,
}

// export the component theme
export const tabsTheme = defineMultiStyleConfig({ variants })
