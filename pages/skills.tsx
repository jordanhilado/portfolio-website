import { Box, Center, Flex, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { Badge } from "../components/Badge";
import sk from "../data/skills.json";

const Skills: NextPage = () => {
  return (
    <Box color="brand.400" pt={130} id="skills" h="fit-content" mb={100}>
      <Box textAlign="center">
        <Text as="b" fontSize="3xl">
          Technical Skills
        </Text>
      </Box>
      <Center>
        <Box w="800px">
          {sk.map((s, i) => {
            return (
              <div key={i}>
                <Text as="b" fontSize="2xl">
                  {s.group}
                </Text>
                <Flex
                  key={i}
                  flexWrap="wrap"
                  flexDirection="row"
                  justifyContent="start"
                >
                  {s.list.map((l, idx) => {
                    return (
                      <>
                        <Badge key={idx} name={l.name} icon={l.icon} />
                      </>
                    );
                  })}
                </Flex>
              </div>
            );
          })}
        </Box>
      </Center>
    </Box>
  );
};

export default Skills;
