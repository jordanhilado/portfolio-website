import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import {
  Container,
  Box,
  Center,
  Heading,
  Text,
  Stack,
  Avatar,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "../components/Card";

const Experience: NextPage = () => {
  return (
    <Box bg="lightyellow" id="experience" h="100vh">
      <Container pt={130} textAlign="center">
        <Text as="b" fontSize="5xl">
          experience
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

export default Experience;
