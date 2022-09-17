import { Box, Center, useMediaQuery } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Profile from "../components/Profile";
import Education from "./education";
import Experience from "./experience";
import Projects from "./projects";
import Skills from "./skills";

const Home: NextPage = () => {
  const [mobile] = useMediaQuery("(min-width: 10px)");
  return (
    <>
      {mobile ? (
        <div>
          <Head>
            <title>jordan hilado</title>
          </Head>

          <main>
            <Box bg="red" mb={60}></Box>
            <Center>
              <Profile />
            </Center>
          </main>
          <Skills />
          <Education />
          <Experience />
          <Projects />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default Home;
