import { GithubFilled, LinkedinFilled, MailOutlined } from "@ant-design/icons";

export const data = {
  bio: "Software Engineer with experience building and maintaining full-stack web and mobile applications in startup and F500 atmospheres",
  location: "Los Angeles, CA",
  contact: [
    {
      name: "Email",
      icon: MailOutlined,
      link: "mailto:jordanalihilado@gmail.com",
    },
    {
      name: "GitHub",
      icon: GithubFilled,
      link: "https://github.com/jordanhilado",
    },
    {
      name: "LinkedIn",
      icon: LinkedinFilled,
      link: "https://www.linkedin.com/in/jordanhilado/",
    },
  ],
  resume_link:
    "https://nbviewer.org/github/jordanhilado/portfolio-website/blob/main/src/assets/resume/Jordan_Ali_Hilado_2024.pdf",
  about: "Currently seeking full-time software engineer opportunities.",
  education: [
    {
      title: "California State University, Long Beach",
      subtitle: "B.S. Computer Science, University Honors Program",
      date: "2020 - 2023",
    },
  ],
  experience: [
    {
      title: "Software Engineer Intern",
      company: "Walt Disney Animation Studios",
      date: "May 2023 - Aug 2023",
      description:
        "Rewrote outdated linux-native internal drafting tool into React, TypeScript, GraphQL web application used for editing animated shot sequence metadata from Autodesk ShotGrid",
    },
    {
      title: "Software Engineer",
      company: "Handle Delivery",
      date: "Mar 2023 - May 2023",
      description:
        "One of three full-stack engineers on the engineering team, maintaining applications serving over 13,000 students across 6 universities",
    },
    {
      title: "Software Engineer Intern",
      company: "Walt Disney Animation Studios",
      date: "May 2022 - Aug 2022",
      description:
        "Maintained and improved internal business applications used by hundreds of artists, engineers, and production management staff",
    },
  ],
  projects: [
    {
      title:
        "Comparative Study of Text-to-Image Models: A Focus on Subject-Specific Training for Improved Generation",
      description:
        "This comparative study investigates the potential of text-to-image generative models to produce subject-driven content, focusing on Stable Diffusion 1.1.",
      link: "https://github.com/csulb-datascience/Fine-Tuning-on-Stable-Diffusion",
      tags: ["Python", "Diffusers", "PyTorch", "Hugging Face"],
    },
    {
      title: "Codebase",
      description:
        "A full-stack web application that allows users to create, share, and collaborate on code snippets",
      link: "https://codebase-kappa.vercel.app/",
      tags: ["React", "Next.js", "TypeScript", "Python", "LangChain"],
    },
    {
      title: "Anonversations",
      description: "Small Reddit clone",
      link: "https://github.com/jordanhilado/Anonversations",
      tags: ["React", "TypeScript", "PostgreSQL", "GraphQL"],
    },
  ],
  skills: [
    "React",
    "TypeScript",
    "GraphQL",
    "SQL",
    "Java",
    "C++",
    "Ruby",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Django",
    "FastAPI",
    "Next.js",
  ],
};
