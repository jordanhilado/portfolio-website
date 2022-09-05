import React from "react";
import { Box, Flex, Button, useMediaQuery, Heading } from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "react-scroll";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [mobile] = useMediaQuery("(min-width: 950px)");
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
            bg="white"
            flexDirection="column"
            alignItems="center"
          >
            <Flex width="fit-content" mb={4}>
              <NextLink href="/">
                <a>
                  <Heading>jordan hilado</Heading>
                </a>
              </NextLink>
            </Flex>
            <Flex width="550px" justifyContent="space-between">
              <Link to="education" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="green" size="md">
                  education
                </Button>
              </Link>
              <Link to="experience" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="green" size="md">
                  experience
                </Button>
              </Link>
              <Link to="projects" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="green" size="md">
                  projects
                </Button>
              </Link>
              <Link to="skills" spy={true} smooth={true} duration={1000}>
                <Button colorScheme="green" size="md">
                  skills
                </Button>
              </Link>
              <a
                href="https://tinyurl.com/hiladojordan2023"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button colorScheme="green" size="md" variant="outline">
                  resume
                </Button>
              </a>
            </Flex>
          </Flex>
        </Box>
      ) : (
        <Box>
          <Flex justifyContent="center" zIndex={1} position="sticky" p={4}>
            <Flex
              width="300px"
              flexDirection="column"
              justifyContent="space-between"
              height="290px"
            >
              <NextLink href="/">
                <Link>
                  <Heading textAlign="center">jordan hilado</Heading>
                </Link>
              </NextLink>
              <NextLink href="/education">
                <Button colorScheme="green" size="md">
                  education
                </Button>
              </NextLink>
              <NextLink href="/experience">
                <Button colorScheme="green" size="md">
                  experience
                </Button>
              </NextLink>
              <NextLink href="/projects">
                <Button colorScheme="green" size="md">
                  projects
                </Button>
              </NextLink>
              <NextLink href="/skills">
                <Button colorScheme="green" size="md">
                  skills
                </Button>
              </NextLink>
              <a
                href="https://tinyurl.com/hiladojordan2023"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  colorScheme="green"
                  width="100%"
                  size="md"
                  variant="outline"
                >
                  resume
                </Button>
              </a>
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
};
