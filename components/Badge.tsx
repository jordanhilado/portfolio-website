import {
  Box,
  Center,
  Heading,
  Text,
  Stack,
  Flex,
  Avatar,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";

export default function Badge() {
  return (
    <Box
      //   textAlign="right"
      borderWidth="1px"
      width="fit-content"
      px={4}
      borderRadius="full"
      fontSize="20px"
      borderColor="black"
      m={1.5}
    >
      <Center>
        <Image src="/python.png" boxSize="25px" />
        <Text fontSize="3xl" pl={2}>
          python
        </Text>
      </Center>
    </Box>
  );
}
