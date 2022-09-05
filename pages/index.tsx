import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text } from "@chakra-ui/react";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>jordan hilado</title>
      </Head>

      <main>
        <Container textAlign="center">
          <Text as="b" fontSize="5xl">
            jordan hilado
          </Text>
        </Container>
        <Container>
          i’m a junior at cal state long beach majoring in computer science. i
          enjoy building full-stack software applications. when i’m not coding,
          i’m either listening to podcasts, 3d printing, or playing sports like
          basketball or golf.
        </Container>
      </main>

      <Container textAlign="center">Last updated 9/5/2022</Container>
    </div>
  );
};

export default Home;
