import {
  Button,
  Card,
  CardBody,
  Heading,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";

interface ExperienceCardProps {
  title: string;
  posloc: string;
  description: string;
  date: string;
  image: string;
  link?: string;
}

export const ExperienceCard = ({
  image,
  title,
  description,
  posloc,
  date,
  link,
}: ExperienceCardProps) => {
  return (
    <Card
      maxW="md"
      rounded={"35"}
      bg={"brand.200"}
      borderWidth="1px"
      borderColor={"brand.300"}
      p={2}
      m={3}
      height={"fit"}
    >
      <CardBody>
        <Image
          src={image}
          alt="Green double couch with wooden legs"
          borderRadius="3xl"
        />
        <Stack mt="6" spacing={0}>
          <Heading
            size="md"
            color={"brand.400"}
            fontSize={"2xl"}
            fontFamily={"body"}
            mb={2}
          >
            {title}
          </Heading>
          <Text color={"brand.400"} mb={2}>
            {description}
          </Text>
          <Text color={"brand.500"} fontWeight={600}>
            {posloc}
          </Text>
          <Text color={"brand.500"}>{date}</Text>
        </Stack>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <Button mt={3} colorScheme="teal">
              View
            </Button>
          </a>
        )}
      </CardBody>
    </Card>
  );
};
