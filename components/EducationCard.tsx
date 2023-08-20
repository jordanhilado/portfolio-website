import { Box, Button, Center, Heading, Stack, Text } from "@chakra-ui/react";

interface EducationCardProps {
  clubName: string;
  description: string;
  position: string;
  date: string;
  link?: string;
}

export const EducationCard = ({
  clubName,
  description,
  position,
  date,
  link,
}: EducationCardProps) => {
  return (
    <Center py={2} mx={3}>
      <Box
        borderWidth="1px"
        borderColor={"brand.300"}
        w="300px"
        bg="brand.200"
        rounded={"35"}
        p={6}
        overflow={"hidden"}
      >
        <Stack>
          <Heading color="brand.400" fontSize={"xl"} fontFamily={"body"}>
            {clubName}
          </Heading>
          <Text color={"brand.400"}>{description}</Text>
        </Stack>
        <Stack mt={3} direction={"row"} spacing={4} align={"center"}>
          <Stack direction={"column"} spacing={0} fontSize={"sm"}>
            <Text color={"brand.500"} fontWeight={600}>
              {position}
            </Text>
            <Text color={"brand.500"}>{date}</Text>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Button mt={3} colorScheme="teal">
                  View
                </Button>
              </a>
            )}
          </Stack>
        </Stack>
      </Box>
    </Center>
  );
};
