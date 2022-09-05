import React from "react";
import {
  Box,
  Link,
  Flex,
  Button,
  useMediaQuery,
  Heading,
} from "@chakra-ui/react";
import NextLink from "next/link";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [mobile] = useMediaQuery("(min-width: 780px)");
  return (
    <>
      {mobile ? (
        <Box>
          <Flex
            zIndex={1}
            position="sticky"
            top={0}
            p={4}
            justifyContent="center"
          >
            <Flex width="780px" justifyContent="space-between">
              <NextLink href="/">
                <Link>
                  <Heading>jordan hilado</Heading>
                </Link>
              </NextLink>
              <NextLink href="/experience">
                <Button colorScheme="teal" size="lg">
                  experience
                </Button>
              </NextLink>
              <NextLink href="/projects">
                <Button colorScheme="teal" size="lg">
                  projects
                </Button>
              </NextLink>
              <NextLink href="/education">
                <Button colorScheme="teal" size="lg">
                  education
                </Button>
              </NextLink>
              <NextLink href="/skills">
                <Button colorScheme="teal" size="lg">
                  skills
                </Button>
              </NextLink>
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
              height="250px"
            >
              <NextLink href="/">
                <Link>
                  <Heading textAlign="center">jordan hilado</Heading>
                </Link>
              </NextLink>
              <NextLink href="/experience">
                <Button colorScheme="teal" size="md">
                  experience
                </Button>
              </NextLink>
              <NextLink href="/projects">
                <Button colorScheme="teal" size="md">
                  projects
                </Button>
              </NextLink>
              <NextLink href="/education">
                <Button colorScheme="teal" size="md">
                  education
                </Button>
              </NextLink>
              <NextLink href="/skills">
                <Button colorScheme="teal" size="md">
                  skills
                </Button>
              </NextLink>
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
};
