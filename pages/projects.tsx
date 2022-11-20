import { Box, Center, Container, Flex, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { CardC } from "../components/CardC";
import Projs from "../data/projects.json";

const Projects: NextPage = () => {
  return (
    <Box id="projects" h="100vh">
      <Container pt={130} textAlign="center">
        <Text as="b" color="brand.400" fontSize="5xl">
          Projects
        </Text>
      </Container>
      <Center>
        <Box width="1500px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Projs.map((proj) => {
              return (
                <>
                  <CardC
                    link={proj.link}
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
