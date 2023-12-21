import boTheme from "@blocto/web-chakra-theme";
import { extendTheme } from "@chakra-ui/react";
import merge from "lodash.merge";

import { tagAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tagAnatomy.keys);

const baseStyle = definePartsStyle({
  container: {
    bg: " background.secondary",
    color: "font.highlight",
    py: "4px",
    px: "10px",
  },
});
const tagTheme = defineMultiStyleConfig({
  baseStyle,
});

const IS_PROD = import.meta.env.VITE_APP_ENV === "production";

const variants = {
  darkCard: definePartsStyle({
    container: {
      bg: 'gray.700',
      color: 'white',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid white',
      p: "16px"
    }
  })
};

const cardTheme = defineMultiStyleConfig({ variants });

const theme = extendTheme(
  merge(boTheme, {
    semanticTokens: {
      colors: {
        "network.hint": IS_PROD ? "transparent" : "status.warning.light",
        "network.hint.text": IS_PROD ? "transparent" : "status.warning.dark",
      },
    },
    styles: {
      global: {
        html: {
          fontSize: "16px",
        },
        "html body": {
          minHeight: "100%",
          width: "100%",
          bg: 'gray.800',
          color: 'white',
        },
        body: {
          fontFamily: "boFontFamily.base",
          fontSize: "size.body.3",
          lineHeight: "line.height.body.3",
          textRendering: "geometricPrecision",

        },
        "body.fontLoaded": {
          fontFamily: "boFontFamily.base",
        },
        button: {
          textRendering: "geometricPrecision",
          WebkitTapHighlightColor: "transparent",
        },
        "[role=button]": {
          WebkitTapHighlightColor: "transparent",
        },
      },
    },
    components: {
      Card: cardTheme,
      Tag: tagTheme,
      Button: {
        fontSize: "size.heading.5",
        fontWeight: "weight.l",
        lineHeight: "line.height.heading.4",
        baseStyle: {
          _hover: {
            transform: "scale(0.98)",
            _disabled: { transform: "none" },
          },
          _active: {
            transform: "scale(0.96)",
            _disabled: { transform: "none" },
          },
          _disabled: {
            cursor: "not-allowed",
          },
        },
        variants: {
          primary: {
            width: "100%",
            height: "54px",
            py: "space.m",
            bg: "gray.100",
            borderRadius: "6px",
            color: "#2A1136",
            _hover: {
              bg: { md: "white" },
              _disabled: { bg: "#DBDBDB" },
            },
            _active: {
              bg: "white",
            },
            _disabled: {
              bg: "#DBDBDB",
              opacity: 1,
              color: "rgba(42,17 ,54, 0.5)",
            },
          },
          secondary: {
            width: "100%",
            py: "space.m",
            bg: "interaction.secondary",
            color: "font.highlight",
            borderRadius: "12px",
            _hover: {
              bg: { md: "interaction.secondary.hovered" },
            },
            _active: {
              bg: "interaction.secondary.pressed",
            },
            _disabled: {
              bg: "interaction.secondary.disabled",
            },
          },
          support: {
            height: "46px",
            py: "space.s",
            px: "space.m",
            bg: "#76D68A",
            color: "font.inverse",
            borderRadius: "100px",
            _hover: {
              bg: { md: "interaction.primary.hovered" },
              _disabled: { bg: "interaction.primary.disabled" },
            },
            _active: {
              bg: "#76D68A",
            },
            _disabled: {
              bg: "interaction.primary.disabled",
            },
          },
          plain: {
            padding: 0,
            fontSize: "size.body.3",
            fontWeight: "weight.s",
            lineHeight: "line.height.body.3",
            _active: {
              color: "font.primary.pressed",
              svg: { fill: "icon.secondary" },
              _disabled: { color: "inherit", svg: { fill: "icon.primary" } },
            },
          },
          outlineDark: {
            border: '2px solid',
            borderColor: 'gray.600',
            color: 'white',
            bg: 'transparent',
            _hover: {
              bg: 'gray.800',
              color: 'white',
            },
            _active: {
              bg: 'gray.800',
              borderColor: 'gray.400',
            },
            _disabled: {
              bg: 'gray.700',
              borderColor: 'gray.500',
              opacity: 0.6,
            },
          },
        },
      },
    },
  })
);

export default theme;
