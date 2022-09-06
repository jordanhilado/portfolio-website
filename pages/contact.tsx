import { Container, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";

const Contact: NextPage = () => {
  return (
    <div>
      <Head>
        <title>jordan hilado - contact</title>
      </Head>

      <main>
        <Container textAlign="center">
          <Text as="b" fontSize="5xl">
            Contact
          </Text>
        </Container>
        <Container>Contact</Container>
      </main>

      <Container textAlign="center">Last updated 9/5/2022</Container>
    </div>
  );
};

export default Contact;
