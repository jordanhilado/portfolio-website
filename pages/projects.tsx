import { Box, Center, Container, Flex, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { ProjectCard } from "../components/ProjectCard";
import Projs from "../data/projects.json";

const Projects: NextPage = () => {
  return (
    <Box id="projects" h="100vh">
      <Container pt={130} textAlign="center">
        <Text as="b" color="brand.400" fontSize="3xl">
          Projects
        </Text>
      </Container>
      <Center>
        <Box width="1500px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Projs.map((proj, i) => {
              return (
                <>
                  <ProjectCard
                    key={i}
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
