import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Center, Text, Box, Flex } from "@chakra-ui/react";
import Card from "../components/Card";

const Education: NextPage = () => {
  return (
    <Box bg="lightskyblue" id="education" h="fit-content">
      <Container pt={130} textAlign="center">
        <Text as="b" fontSize="5xl">
          education
        </Text>
      </Container>
      <Container textAlign="center">
        <Text fontSize="2xl">california state university, long beach</Text>
        <Text fontSize="1xl">
          b.s. computer science | august 2020 - december 2023
        </Text>
      </Container>
      <Container textAlign="center">
        <Text as="b" fontSize="3xl">
          clubs and activities
        </Text>
      </Container>
      <Center>
        <Box width="1000px" bg="orange">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            <Card />
            <Card />
            <Card />
          </Flex>
        </Box>
      </Center>
    </Box>
  );
};

export default Education;
