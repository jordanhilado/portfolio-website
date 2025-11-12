export const data = {
  sections: ["About", "Projects", "Blogs", "Hobbies"] as const,
  contact: [
    { name: "GitHub", link: "https://github.com/jordanhilado" },
    { name: "LinkedIn", link: "https://www.linkedin.com/in/jordanhilado/" },
    { name: "X", link: "https://x.com/jordanhilado" },
    { name: "Email", link: "jordanalihilado at gmail dot com" },
  ],
  about: {
    paragraphs: [
      "Hi, I'm Jordan. I'm a 23 y/o software engineer interested in building innovative distributed cloud systems to scale AI and machine learning operations.",
      "Currently, I'm at Microsoft working on Azure Resource Graph, the world's largest cloud inventory management platform.",
      "Previously, I built film production software for Disney Animation, which helped produce Wish, Moana 2, Zootopia 2, and more.", 
      "Before that, I optimized mobile payment systems for Handle Delivery, a startup that served thousands of students across six universities.",
      "In my free time, I enjoy long-distance running, snowboarding, and reading about technology (history, startups, emerging research).",
      "I grew up in Los Angeles and currently live in San Francisco.",
    ],
  },
  hobbies:
    "Running, reading, building side projects, and exploring new technologies.",
  blogsPlaceholder: "...",
  heroAlt: "Zion National Park",
  resume_link:
    "https://nbviewer.org/github/jordanhilado/portfolio-website/blob/main/src/assets/resume/Jordan_Ali_Hilado_2025.pdf",
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
};
