import { Center, Container, Image, useMediaQuery } from "@chakra-ui/react";
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
            <Center h="100vh">
              <Profile />
            </Center>
          </main>
          <Skills />
          <Education />
          <Experience />
          <Projects />
        </div>
      ) : (
        <div>
          <Head>
            <title>jordan hilado</title>
          </Head>

          <main>
            <Center h="60vh">
              <Container textAlign="center">
                <Center>
                  <Image
                    src="/headshot.jpeg"
                    alt="jordan hilado"
                    boxSize="150px"
                  />
                </Center>
              </Container>
            </Center>
          </main>
        </div>
      )}
    </>
  );
};

export default Home;
