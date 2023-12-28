import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools' // import utility to set light and dark mode props

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const marketplaceVariant = definePartsStyle((props) => {
  const { colorScheme: c } = props // extract colorScheme from component props
  console.log('colorScheme :', c);

  return {
    tab: {
      border: '2px solid',
      borderColor: 'transparent',
      bg: 'transparent',
      borderTopRadius: 'lg',
      borderBottom: 'none',
      _selected: {
        color: mode('#fff', 'gray.800')(props),
        bg: 'transparent',
        borderColor: 'inherit',
        borderBottom: 'none',
        mb: '-2px',
      },
      _focus: {
        outline: 'none',
        outlineWidth: '0',
        boxShadow: 'none',
      },
      _active: {
        outline: 'none',
        outlineWidth: '0',
        boxShadow: 'none',
      },
      _focusVisible: {
        outline: 'none',
        outlineWidth: '0',
        boxShadow: 'none',
      },
      _focusWithin: {
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
