import { Box, Center, Image, Text } from "@chakra-ui/react";

interface BadgeProps {
  name: string;
  icon: string;
}

export const Badge = ({ name, icon }: BadgeProps) => {
  return (
    <Box
      borderWidth="2px"
      width="fit-content"
      px={4}
      py={1}
      borderRadius="full"
      fontSize="20px"
      fontWeight={"200"}
      borderColor="brand.300"
      m={1.5}
    >
      <Center>
        <Image src={icon} boxSize="25px" alt={name} />
        <Text fontSize="lg" pl={2}>
          {name}
        </Text>
      </Center>
    </Box>
  );
};
