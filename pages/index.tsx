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
              {/* <Container textAlign="center">
                <Center p={10}>
                  <Image
                    src="/headshot.jpeg"
                    alt="jordan hilado"
                    boxSize="150px"
                  />
                </Center>
                i’m a junior at cal state long beach majoring in computer
                science. i enjoy building full-stack software applications. when
                i’m not coding, i’m either listening to podcasts, 3d printing,
                or playing sports like basketball or golf.
              </Container> */}
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
                i’m a junior at cal state long beach majoring in computer
                science. i enjoy building full-stack software applications. when
                i’m not coding, i’m either listening to podcasts, 3d printing,
                or playing sports like basketball or golf.
              </Container>
            </Center>
          </main>
        </div>
      )}
    </>
  );
};

export default Home;
