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
import { AiFillLinkedin, AiOutlineGithub } from "react-icons/ai";

export default function Profile() {
  const [mobile] = useMediaQuery("(min-width: 600px)");

  const ProfileCardData = () => {
    return (
      <>
        <Flex flex={1}>
          <Image
            borderRadius="20"
            objectFit="cover"
            boxSize="100%"
            src={"/JordanHiladoHeadshot6.png"}
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
          <Text color="brand.400" px={3}>
            {
              "Hello, I'm Jordan! I enjoy building full-stack web and mobile applications. Some of my hobbies include basketball, golf, hiking, thrifting, and 3D printing."
            }
          </Text>
          <Link
            textAlign={"center"}
            fontWeight={600}
            color={"brand.500"}
            size="sm"
            href="mailto:jordanalihilado@gmail.com"
          >
            jordanalihilado@gmail.com
          </Link>
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
                aria-label="linkedin"
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
                aria-label="github"
                fontSize="40px"
                icon={<AiOutlineGithub />}
              />
            </Link>
          </Stack>
        </Stack>
      </>
    );
  };

  return (
    <>
      {mobile ? (
        <Center>
          <Stack
            borderWidth="1px"
            borderColor={"brand.300"}
            borderRadius="35"
            direction="row"
            bg="brand.200"
            padding={8}
            w="xl"
          >
            {ProfileCardData()}
          </Stack>
        </Center>
      ) : (
        <Center>
          <Stack
            borderWidth="1px"
            borderColor={"brand.300"}
            borderRadius="35"
            direction="column"
            bg="brand.200"
            padding={8}
            w="360px"
          >
            {ProfileCardData()}
          </Stack>
        </Center>
      )}
    </>
  );
}
