import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text, Box } from "@chakra-ui/react";

const Education: NextPage = () => {
  return (
    <Box id="section1">
      <Head>
        <title>jordan hilado - education</title>
      </Head>

      <main>
        <Container h="100vh" textAlign="center">
          <Text as="b" fontSize="5xl">
            Education
          </Text>
        </Container>
        <Container>Education</Container>
      </main>

      <Container textAlign="center">Last updated 9/5/2022</Container>
    </Box>
  );
};

export default Education;
