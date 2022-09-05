import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { NavBar } from "../components/NavBar";
import Education from "./education";
import Experience from "./experience";
import Projects from "./projects";
import Skills from "./skills";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <NavBar />
      <Component {...pageProps} />
      <Education />
      <Experience />
      <Projects />
      <Skills />
    </ChakraProvider>
  );
}

export default MyApp;
