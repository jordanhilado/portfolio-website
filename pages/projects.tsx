import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { Container, Text, Center, Box, Flex } from "@chakra-ui/react";
// import Card from "../components/Card";
import { Card3 } from "../components/Card3";
import Projs from "../data/projects.json";

const Projects: NextPage = () => {
  return (
    <Box id="projects" h="fit-content">
      <Container pt={130} textAlign="center">
        <Text as="b" fontSize="5xl">
          projects
        </Text>
      </Container>
      <Center>
        <Box width="1500px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Projs.map((proj) => {
              return (
                <>
                  <Card3
                    stack={proj.stack}
                    clubName={proj.title}
                    description={proj.description}
                    date={proj.date}
                  />
                </>
              );
            })}
          </Flex>
        </Box>
      </Center>
    </Box>
  );
};

export default Projects;
