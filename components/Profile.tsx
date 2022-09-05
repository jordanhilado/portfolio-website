import {
  Badge,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Link,
  Stack,
  Text,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react";
import {
  AiFillLinkedin,
  AiOutlineGithub,
  AiFillInstagram,
  AiFillTwitterCircle,
} from "react-icons/ai";

export default function Profile() {
  return (
    <Center py={6}>
      <Stack
        // borderWidth="1px"
        borderRadius="35"
        w={{ sm: "100%", md: "500px" }}
        // height={{ sm: "476px", md: "20rem" }}
        direction={{ base: "column", md: "row" }}
        bg={useColorModeValue("grey", "gray.900")}
        // boxShadow={"2xl"}
        padding={4}
      >
        <Flex flex={1} bg="blue.200">
          <Image
            borderRadius="35"
            objectFit="cover"
            boxSize="100%"
            src={"/headshot.jpeg"}
          />
        </Flex>
        <Stack
          flex={1}
          flexDirection="column"
          justifyContent="center"
          p={1}
          pt={2}
        >
          {/* <Heading fontSize={"2xl"} fontFamily={"body"}>
            hi. i'm jordan.
          </Heading> */}
          {/* <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
            @jordanhilado
          </Text> */}
          <Text
            // textAlign={"center"}
            color={useColorModeValue("gray.700", "gray.400")}
            px={3}
          >
            hi i'm jordan. i like building things with code. some of my hobbies
            include listening to music and podcasts, 3d printing, and playing
            basketball and golf.
            {/* <Link href={"#"} color={"blue.400"}>
              #tag
            </Link> */}
            {/* me in your posts */}
          </Text>
          {/* <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue("gray.50", "gray.800")}
              fontWeight={"400"}
            >
              #art
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue("gray.50", "gray.800")}
              fontWeight={"400"}
            >
              #photography
            </Badge>
            <Badge
              px={2}
              py={1}
              bg={useColorModeValue("gray.50", "gray.800")}
              fontWeight={"400"}
            >
              #music
            </Badge>
          </Stack> */}

          <Stack
            width={"100%"}
            mt={"2rem"}
            direction={"row"}
            padding={2}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Link
              href="https://tinyurl.com/hiladojordan2023"
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
              href="https://tinyurl.com/hiladojordan2023"
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
            <Link
              href="https://tinyurl.com/hiladojordan2023"
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
              href="https://tinyurl.com/hiladojordan2023"
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
            </Link>
            {/* <Button
              flex={1}
              fontSize={"sm"}
              rounded={"full"}
              bg={"blue.400"}
              color={"white"}
              boxShadow={
                "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
              }
              _hover={{
                bg: "blue.500",
              }}
              _focus={{
                bg: "blue.500",
              }}
            >
              Follow
            </Button> */}
          </Stack>
        </Stack>
      </Stack>
    </Center>
  );
}
