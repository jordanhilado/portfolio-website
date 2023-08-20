import { Box, Center, Container, Flex, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { ExperienceCard } from "../components/ExperienceCard";
import Exp from "../data/experience.json";

const Experience: NextPage = () => {
  return (
    <Box id="experience" h="fit-content">
      <Container pt={130} textAlign="center">
        <Text as="b" fontSize="3xl" color="brand.400">
          Experience
        </Text>
      </Container>
      <Center>
        <Box width="1800px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Exp.map((exp, i) => {
              return (
                <>
                  <ExperienceCard
                    key={i}
                    title={exp.title}
                    posloc={exp.posloc}
                    description={exp.description}
                    date={exp.date}
                    image={exp.image}
                    link={exp.link}
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

export default Experience;
