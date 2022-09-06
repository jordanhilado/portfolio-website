import { Box, Center, Container, Flex, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { CardB } from "../components/CardB";
import Clubs from "../data/clubs.json";

const Education: NextPage = () => {
  return (
    <Box id="education" h="fit-content">
      <Container pt={130} textAlign="center">
        <Text as="b" color="brand.400" fontSize="5xl">
          education
        </Text>
        <Text color="brand.400" fontSize="2xl">
          california state university, long beach
        </Text>
        <Text color="brand.500" fontSize="1xl">
          b.s. computer science | august 2020 - december 2023
        </Text>
      </Container>
      <Container mt={5} textAlign="center">
        <Text as="b" color="brand.400" fontSize="3xl">
          clubs and activities
        </Text>
      </Container>
      <Center>
        <Box width="1000px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Clubs.map((club) => {
              return (
                <>
                  <CardB
                    clubName={club.clubName}
                    description={club.description}
                    position={club.position}
                    date={club.date}
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

export default Education;
