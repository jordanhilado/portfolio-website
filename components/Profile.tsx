import {
  Center,
  Flex,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import {
  AiFillInstagram,
  AiFillLinkedin,
  AiFillTwitterCircle,
  AiOutlineGithub,
} from "react-icons/ai";

export default function Profile() {
  const [mobile] = useMediaQuery("(min-width: 600px)");
  return (
    <>
      {mobile ? (
        <Center>
          <Stack
            borderWidth="1px"
            borderColor={"brand.300"}
            borderRadius="35"
            // w={{ sm: "400px", md: "xl" }}
            // height={{ sm: "476px", md: "20rem" }}
            // direction={{ sm: "column", md: "row" }}
            direction="row"
            // bg={useColorModeValue("grey", "gray.900")}
            bg="brand.200"
            // boxShadow={"2xl"}
            padding={8}
            w="xl"
          >
            <Flex flex={1}>
              <Image
                borderRadius="10"
                bg="black"
                objectFit="cover"
                boxSize="100%"
                src={"/headshot.jpeg"}
                alt={"headshot"}
              />
            </Flex>
            <Stack
              flex={1}
              flexDirection="column"
              justifyContent="center"
              p={1}
              pt={2}
            >
              <Text
                // color={useColorModeValue("gray.700", "gray.400")}
                color="brand.400"
                px={3}
              >
                {
                  "hi i'm jordan. i have a passion for building full-stack applications. some of my hobbies include listening to music or podcasts, 3d printing, and playing sports like basketball and golf."
                }
              </Text>
              <Text
                textAlign={"center"}
                fontWeight={600}
                color={"brand.500"}
                size="sm"
              >
                jordanalihilado@gmail.com
              </Text>
              <Stack
                width={"100%"}
                mt={"2rem"}
                direction={"row"}
                padding={2}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Link
                  href="https://www.linkedin.com/in/jordanhilado"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    size="lg"
                    colorScheme="teal"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiFillLinkedin />}
                  />
                </Link>
                <Link
                  href="https://github.com/jordanhilado"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    colorScheme="teal"
                    size="lg"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiOutlineGithub />}
                  />
                </Link>
                {/* <Link
                  href="https://www.instagram.com/jordanhilado/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    size="lg"
                    colorScheme="teal"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiFillInstagram />}
                  />
                </Link>
                <Link
                  href="https://twitter.com/jordanhilado"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    size="lg"
                    colorScheme="teal"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiFillTwitterCircle />}
                  />
                </Link> */}
              </Stack>
            </Stack>
          </Stack>
        </Center>
      ) : (
        <Center>
          <Stack
            borderWidth="1px"
            borderColor={"brand.300"}
            borderRadius="35"
            // w={{ sm: "400px", md: "xl" }}
            // height={{ sm: "476px", md: "20rem" }}
            // direction={{ sm: "column", md: "row" }}
            direction="column"
            // bg={useColorModeValue("grey", "gray.900")}
            bg="brand.200"
            // boxShadow={"2xl"}
            padding={8}
            w="360px"
          >
            <Flex flex={1}>
              <Image
                borderRadius="10"
                bg="black"
                objectFit="cover"
                boxSize="100%"
                src={"/headshot.jpeg"}
                alt={"headshot"}
              />
            </Flex>
            <Stack
              flex={1}
              flexDirection="column"
              justifyContent="center"
              p={1}
              pt={2}
            >
              <Text
                // color={useColorModeValue("gray.700", "gray.400")}
                color="brand.400"
                px={3}
              >
                {
                  "hi i'm jordan. i have a passion for building full-stack applications. some of my hobbies include listening to music or podcasts, 3d printing, and playing sports like basketball and golf."
                }
              </Text>
              <Text
                textAlign={"center"}
                fontWeight={600}
                color={"brand.500"}
                size="sm"
              >
                jordanalihilado@gmail.com
              </Text>
              <Stack
                width={"100%"}
                mt={"2rem"}
                direction={"row"}
                padding={2}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Link
                  href="https://www.linkedin.com/in/jordanhilado"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    size="lg"
                    colorScheme="teal"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiFillLinkedin />}
                  />
                </Link>
                <Link
                  href="https://github.com/jordanhilado"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    colorScheme="teal"
                    size="lg"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiOutlineGithub />}
                  />
                </Link>
                {/* <Link
                  href="https://www.instagram.com/jordanhilado/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    size="lg"
                    colorScheme="teal"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiFillInstagram />}
                  />
                </Link>
                <Link
                  href="https://twitter.com/jordanhilado"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconButton
                    variant="outline"
                    size="lg"
                    colorScheme="teal"
                    aria-label="Call Sage"
                    fontSize="40px"
                    icon={<AiFillTwitterCircle />}
                  />
                </Link> */}
              </Stack>
            </Stack>
          </Stack>
        </Center>
      )}
    </>
  );
}
