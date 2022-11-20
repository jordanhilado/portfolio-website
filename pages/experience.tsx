import { Box, Center, Container, Flex, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { CardA } from "../components/CardA";
import Exp from "../data/experience.json";

const Experience: NextPage = () => {
  return (
    <Box id="experience" h="fit-content">
      <Container pt={130} textAlign="center">
        <Text as="b" fontSize="5xl" color="brand.400">
          Experience
        </Text>
      </Container>
      <Center>
        <Box width="1800px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Exp.map((exp) => {
              return (
                <>
                  <CardA
                    title={exp.title}
                    posloc={exp.posloc}
                    description={exp.description}
                    date={exp.date}
                    image={exp.image}
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
