import { Box, Button, Flex, Heading, useMediaQuery } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { Link } from "react-scroll";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [mobile] = useMediaQuery("(min-width: 425px)");
  return (
    <>
      {mobile ? (
        <Box>
          <Flex
            zIndex={1}
            position="fixed"
            width="100%"
            top={0}
            p={4}
            // bg="rgba(255, 255, 255, 0.2)"
            // backdropFilter={"blur(10px)"}
            bg="brand.100"
            flexDirection="column"
            alignItems="center"
          >
            <Flex width="fit-content" mb={4}>
              <NextLink href="/">
                <a>
                  <Heading size="2xl" color="brand.400">
                    jordan hilado
                  </Heading>
                </a>
              </NextLink>
            </Flex>
            <Flex width="550px" justifyContent="space-between">
              <Link to="skills" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="teal" size="md">
                  skills
                </Button>
              </Link>
              <Link to="education" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="teal" size="md">
                  education
                </Button>
              </Link>
              <Link to="experience" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="teal" size="md">
                  experience
                </Button>
              </Link>
              <Link to="projects" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="teal" size="md">
                  projects
                </Button>
              </Link>
              <a
                href="https://tinyurl.com/hiladojordan2023"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button colorScheme="teal" size="md" variant="outline">
                  résumé
                </Button>
              </a>
            </Flex>
          </Flex>
        </Box>
      ) : (
        <Box>
          <Flex
            zIndex={1}
            position="fixed"
            width="100%"
            // bg="red"
            top={0}
            p={4}
            // bg="rgba(255, 255, 255, 0.1)"
            // backdropFilter={"blur(10px)"}
            bg="brand.100"
            flexDirection="column"
            alignItems="center"
          >
            <Flex width="fit-content" mb={4}>
              <NextLink href="/">
                <a>
                  <Heading size="2xl" color="brand.400">
                    jordan hilado
                  </Heading>
                </a>
              </NextLink>
            </Flex>
            <Flex
              // bg="blue"
              width="450px"
              height="110px"
              flexWrap="wrap"
              justifyContent="space-around"
            >
              <Link
                offset={-70}
                to="skills"
                spy={true}
                smooth={true}
                duration={1000}
              >
                <Button colorScheme="teal" size="md">
                  skills
                </Button>
              </Link>
              <Link
                offset={-70}
                to="education"
                spy={true}
                smooth={true}
                duration={1000}
              >
                <Button colorScheme="teal" size="md">
                  education
                </Button>
              </Link>
              <Link
                offset={-70}
                to="experience"
                spy={true}
                smooth={true}
                duration={1000}
              >
                <Button colorScheme="teal" size="md">
                  experience
                </Button>
              </Link>
              <Link
                offset={-70}
                to="projects"
                spy={true}
                smooth={true}
                duration={1000}
              >
                <Button colorScheme="teal" size="md">
                  projects
                </Button>
              </Link>
              <a
                href="https://tinyurl.com/hiladojordan2023"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button colorScheme="teal" size="md" variant="outline">
                  résumé
                </Button>
              </a>
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
};
