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
  const [mobile] = useMediaQuery("(min-width: 950px)");
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
            <Flex width="800px" justifyContent="space-between">
              <NextLink href="/">
                <Link>
                  <Heading>jordan hilado</Heading>
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
              <NextLink
                href="https://tinyurl.com/hiladojordan2023"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button colorScheme="green" size="md" variant="outline">
                  resume
                </Button>
              </NextLink>
            </Flex>
          </Flex>
        </Box>
      )}
    </>
  );
};
