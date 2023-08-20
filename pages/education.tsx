import { Box, Center, Container, Flex, Text } from "@chakra-ui/react";
import type { NextPage } from "next";
import { EducationCard } from "../components/EducationCard";
import Clubs from "../data/clubs.json";

const Education: NextPage = () => {
  return (
    <Box id="education" h="fit-content">
      <Container pt={130} textAlign="center">
        <Text as="b" color="brand.400" fontSize="3xl">
          Education
        </Text>
        <Text color="brand.400" fontSize="xl">
          California State University, Long Beach
        </Text>
        <Text color="brand.500" fontSize="lg">
          B.S. Computer Science | August 2020 - December 2023
        </Text>
      </Container>
      <Container mt={5} textAlign="center">
        <Text as="b" color="brand.400" fontSize="2xl">
          Affiliations
        </Text>
      </Container>
      <Center>
        <Box width="1000px">
          <Flex flexDirection={"row"} flexWrap="wrap" justifyContent="center">
            {Clubs.map((club, i) => {
              if (club.link) {
                return (
                  <>
                    <EducationCard
                      key={i}
                      clubName={club.clubName}
                      description={club.description}
                      position={club.position}
                      date={club.date}
                      link={club.link}
                    />
                  </>
                );
              } else {
                return (
                  <>
                    <EducationCard
                      clubName={club.clubName}
                      description={club.description}
                      position={club.position}
                      date={club.date}
                    />
                  </>
                );
              }
            })}
          </Flex>
        </Box>
      </Center>
    </Box>
  );
};

export default Education;
