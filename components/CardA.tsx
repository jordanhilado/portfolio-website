import { Box, Center, Heading, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";

interface CardAProps {
  title: string;
  posloc: string;
  description: string;
  date: string;
  image: string;
}

export const CardA = ({
  image,
  title,
  description,
  posloc,
  date,
}: CardAProps) => {
  return (
    <Center py={2} mx={4}>
      <Box
        minW={"445px"}
        maxW={"445px"}
        w={"full"}
        // bg={useColorModeValue("white", "gray.900")}
        bg={"brand.200"}
        // boxShadow={"2xl"}
        rounded={"35"}
        p={6}
        overflow={"hidden"}
      >
        <Box
          h={"210px"}
          // bg={"gray.100"}
          mt={-6}
          mx={-6}
          mb={6}
          pos={"relative"}
        >
          <Image src={image} layout={"fill"} alt={image} />
        </Box>
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
            color={"brand.400"}
            fontSize={"2xl"}
            fontFamily={"body"}
          >
            {title}
          </Heading>
        </Stack>
        {/* <Stack mt={6} direction={"row"} spacing={4} align={"center"}> */}
        {/* <Avatar
            src={"https://avatars0.githubusercontent.com/u/1164541?v=4"}
            alt={"Author"}
          /> */}
        <Stack direction={"column"} spacing={0} fontSize={"sm"}>
          <Text color={"brand.500"} fontWeight={600}>
            {posloc}
          </Text>
          <Text color={"brand.500"}>{date}</Text>
        </Stack>
        {/* </Stack> */}
        <Text mt={2} color={"brand.400"}>
          {description}
        </Text>
      </Box>
    </Center>
  );
};
