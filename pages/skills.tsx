import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text, Center, Box, Flex } from "@chakra-ui/react";
import { Badge } from "../components/Badge";
import sk from "../data/skills.json";

const Skills: NextPage = () => {
  return (
    <Box color="brand.400" pt={130} id="skills" h="100vh">
      <Box textAlign="center">
        <Text as="b" fontSize="5xl">
          skills
        </Text>
      </Box>
      <Center>
        <Box w="800px">
          {sk.map((s) => {
            return (
              <>
                <Text as="b" fontSize="3xl">
                  {s.group}
                </Text>
                <Flex
                  flexWrap="wrap"
                  flexDirection="row"
                  justifyContent="start"
                >
                  {s.list.map((l) => {
                    return <Badge name={l.name} icon={l.icon} />;
                  })}
                </Flex>
              </>
            );
          })}
        </Box>
      </Center>
    </Box>
  );
};

export default Skills;
