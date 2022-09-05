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

interface BadgeProps {
  name: string;
  icon: string;
}

export const Badge = ({ name, icon }: BadgeProps) => {
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
        <Image src={icon} boxSize="25px" />
        <Text fontSize="2xl" pl={2}>
          {name}
        </Text>
      </Center>
    </Box>
  );
};
