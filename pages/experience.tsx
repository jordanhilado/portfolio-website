import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text } from "@chakra-ui/react";

const Experience: NextPage = () => {
  return (
    <div>
      <Head>
        <title>jordan hilado - Experience</title>
      </Head>

      <main>
        <Container textAlign="center">
          <Text as="b" fontSize="5xl">
            Experience
          </Text>
        </Container>
        <Container>Experience</Container>
      </main>

      <Container textAlign="center">Last updated 9/5/2022</Container>
    </div>
  );
};

export default Experience;
