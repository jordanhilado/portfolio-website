import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text } from "@chakra-ui/react";

const Projects: NextPage = () => {
  return (
    <div>
      <Head>
        <title>jordan hilado - projects</title>
      </Head>

      <main>
        <Container textAlign="center">
          <Text as="b" fontSize="5xl">
            projects
          </Text>
        </Container>
        <Container>projects</Container>
      </main>

      <Container textAlign="center">Last updated 9/5/2022</Container>
    </div>
  );
};

export default Projects;
