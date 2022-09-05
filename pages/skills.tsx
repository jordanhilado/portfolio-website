import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text } from "@chakra-ui/react";

const Skills: NextPage = () => {
  return (
    <div>
      <Head>
        <title>jordan hilado - skills</title>
      </Head>

      <main>
        <Container textAlign="center">
          <Text as="b" fontSize="5xl">
            skills
          </Text>
        </Container>
        <Container>skills</Container>
      </main>

      <Container textAlign="center">Last updated 9/5/2022</Container>
    </div>
  );
};

export default Skills;
