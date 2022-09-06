import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { NavBar } from "../components/NavBar";

const theme = extendTheme({
  colors: {
    brand: {
      100: "#000000",
      200: "#161618",
      300: "#212124",
      400: "#ffffff",
      500: "#818181",
      600: "#319795",
    },
  },
  styles: {
    global: () => ({
      body: {
        bg: "brand.100",
      },
    }),
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <NavBar />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
