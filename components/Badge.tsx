import { Box, Center, Image, Text } from "@chakra-ui/react";

interface BadgeProps {
  name: string;
  icon: string;
}

export const Badge = ({ name, icon }: BadgeProps) => {
  return (
    <Box
      //   textAlign="right"
      borderWidth="2px"
      width="fit-content"
      px={4}
      borderRadius="full"
      fontSize="20px"
      borderColor="brand.300"
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
