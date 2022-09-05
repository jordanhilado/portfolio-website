import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text, Box, Flex } from "@chakra-ui/react";
import Badge from "../components/Badge";

const Skills: NextPage = () => {
  return (
    <Box bg="lightcyan" id="skills">
      <Container pt={130} h="100vh">
        <Box textAlign="center">
          <Text as="b" fontSize="5xl">
            skills
          </Text>
        </Box>
        <Container bg="grey">
          <Text as="b" fontSize="3xl">
            frameworks
          </Text>
          <Flex
            bg="pink"
            flexWrap="wrap"
            flexDirection="row"
            justifyContent="start"
          >
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
          </Flex>
        </Container>
        <Container bg="grey">
          <Text as="b" fontSize="3xl">
            languages
          </Text>
          <Flex
            bg="pink"
            flexWrap="wrap"
            flexDirection="row"
            justifyContent="start"
          >
            <Badge />
            <Badge />
            <Badge />
            <Badge />
          </Flex>
        </Container>
        <Container bg="grey">
          <Text as="b" fontSize="3xl">
            database
          </Text>
          <Flex
            bg="pink"
            flexWrap="wrap"
            flexDirection="row"
            justifyContent="start"
          >
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
          </Flex>
        </Container>
        <Container bg="grey">
          <Text as="b" fontSize="3xl">
            software & tools
          </Text>
          <Flex
            bg="pink"
            flexWrap="wrap"
            flexDirection="row"
            justifyContent="start"
          >
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
            <Badge />
          </Flex>
        </Container>
      </Container>
    </Box>
  );
};

export default Skills;
