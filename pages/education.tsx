import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text } from "@chakra-ui/react";

const Education: NextPage = () => {
  return (
    <div>
      <Head>
        <title>jordan hilado - Education</title>
      </Head>

      <main>
        <Container textAlign="center">
          <Text as="b" fontSize="5xl">
            Education
          </Text>
        </Container>
        <Container>Education</Container>
      </main>

      <Container textAlign="center">Last updated 9/5/2022</Container>
    </div>
  );
};

export default Education;
