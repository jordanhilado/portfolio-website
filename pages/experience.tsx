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
import { Card } from "../components/Card";
import Exp from "../data/experience.json";

const Experience: NextPage = () => {
  return (
    <Box id="experience" h="fit-content">
      <Container pt={130} textAlign="center">
        <Text as="b" fontSize="5xl" color="brand.400">
          experience
        </Text>
      </Container>
      <Center>
        <Box width="1800px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Exp.map((exp) => {
              return (
                <>
                  <Card
                    title={exp.title}
                    posloc={exp.posloc}
                    description={exp.description}
                    date={exp.date}
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
