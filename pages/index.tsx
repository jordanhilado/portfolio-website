import { Box, Center, useMediaQuery } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import Profile from "../components/Profile";
import Education from "./education";
import Experience from "./experience";
import Projects from "./projects";
import Skills from "./skills";

const Home: NextPage = () => {
  const [mobile] = useMediaQuery("(min-width: 425px)");
  return (
    <>
      {mobile ? (
        <div>
          <Head>
            <link rel="icon" href="/headshot.png" />
            <title>Jordan Hilado</title>
          </Head>
          <main>
            <Box mb={60}></Box>
            <Center>
              <Profile />
            </Center>
          </main>
          <Skills />
          <Experience />
          <Education />
          <Projects />
        </div>
      ) : (
        <div style={{ width: "500px" }}>
          <Head>
            <title>Jordan Hilado</title>
          </Head>
          <main>
            <Box mb={60}></Box>
            <Center>
              <Profile />
            </Center>
          </main>
          <Skills />
          <Experience />
          <Education />
          <Projects />
        </div>
      )}
    </>
  );
};

export default Home;
