import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text, Box, Flex } from "@chakra-ui/react";
import Card from "../components/Card";

const Projects: NextPage = () => {
  return (
    <Box bg="lightblue" id="projects" h="100vh">
      <Container pt={130} textAlign="center">
        <Text as="b" fontSize="5xl">
          projects
        </Text>
      </Container>
      <Flex flexDirection={"row"} justifyContent="space-evenly">
        <Card />
        <Card />
        <Card />
      </Flex>
    </Box>
  );
};

export default Projects;
