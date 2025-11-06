import Home from "../page";

export default function SectionPage() {
  return <Home />;
}

// Generate static params for all sections
export async function generateStaticParams() {
  return [
    { slug: "about" },
    { slug: "projects" },
    { slug: "blogs" },
    { slug: "hobbies" },
    { slug: "contact" },
  ];
}

