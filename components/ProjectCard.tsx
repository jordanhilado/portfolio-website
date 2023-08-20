import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";

interface ProjectCardProps {
  clubName: string;
  description: string;
  date: string;
  stack: string;
  link: string;
}

export const ProjectCard = ({
  link,
  clubName,
  description,
  date,
  stack,
}: ProjectCardProps) => {
  var arr = stack.split(",");
  return (
    <Center py={2} mx={3}>
      <Box
        borderWidth="1px"
        borderColor={"brand.300"}
        w="300px"
        bg={"brand.200"}
        rounded={"35"}
        p={6}
        overflow={"hidden"}
      >
        <Stack>
          <Heading color="brand.400" fontSize={"2xl"} fontFamily={"body"}>
            {clubName}
          </Heading>
          <Text color={"brand.500"}>{date}</Text>
          <Text color={"brand.400"}>{description}</Text>
        </Stack>
        <Stack mt={2} direction={"row"} spacing={4} align={"center"}>
          <Flex flexWrap="wrap">
            {arr.map((s, i) => {
              return (
                <>
                  <Badge
                    key={i}
                    borderRadius="full"
                    px="2"
                    colorScheme="teal"
                    mr="2"
                    mb="2"
                  >
                    {s}
                  </Badge>
                </>
              );
            })}
          </Flex>
        </Stack>
        <a>
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Button mt={3} colorScheme="teal">
              View
            </Button>
          </a>
        </a>
      </Box>
    </Center>
  );
};
