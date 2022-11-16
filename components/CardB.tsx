import { Box, Button, Center, Heading, Stack, Text } from "@chakra-ui/react";

interface CardBProps {
  clubName: string;
  description: string;
  position: string;
  date: string;
  link?: string;
}

export const CardB = ({
  clubName,
  description,
  position,
  date,
  link,
}: CardBProps) => {
  return (
    <Center py={2} mx={3}>
      <Box
        borderWidth="1px"
        borderColor={"brand.300"}
        w="300px"
        // bg={useColorModeValue("white", "gray.900")}
        bg="brand.200"
        // boxShadow={"2xl"}
        rounded={"35"}
        p={6}
        overflow={"hidden"}
      >
        {/* <Box
          h={"150px"}
          bg={"gray.100"}
          mt={-6}
          mx={-6}
          mb={6}
          pos={"relative"}
        >
          <Image
            src={
              "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            }
            layout={"fill"}
          />
        </Box> */}
        <Stack>
          {/* <Text
            color={"green.500"}
            textTransform={"uppercase"}
            fontWeight={800}
            fontSize={"sm"}
            letterSpacing={1.1}
          >
            Blog
          </Text> */}
          <Heading
            // color={useColorModeValue("gray.700", "white")}
            color="brand.400"
            fontSize={"2xl"}
            fontFamily={"body"}
          >
            {clubName}
          </Heading>
          <Text color={"brand.400"}>{description}</Text>
        </Stack>
        <Stack mt={6} direction={"row"} spacing={4} align={"center"}>
          {/* <Avatar
            src={"https://avatars0.githubusercontent.com/u/1164541?v=4"}
            alt={"Author"}
          /> */}
          <Stack direction={"column"} spacing={0} fontSize={"sm"}>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Button mb={3} colorScheme="teal">
                  View
                </Button>
              </a>
            )}
            <Text color={"brand.500"} fontWeight={600}>
              {position}
            </Text>
            <Text color={"brand.500"}>{date}</Text>
          </Stack>
        </Stack>
      </Box>
    </Center>
  );
};
