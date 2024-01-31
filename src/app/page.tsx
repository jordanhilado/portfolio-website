import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GithubFilled,
  GlobalOutlined,
  LinkedinFilled,
  MailOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import headshot from "../assets/headshot-main.png";
import { data } from "../assets/data";
import Link from "next/link";
import { Globe } from "lucide-react";

export default function Home() {
  const profile = (
    <div>
      <div className="flex flex-row justify-between items-center">
        <div className="scroll-m-20 text-3xl font-bold tracking-tight">
          Jordan Ali Hilado
        </div>
        <ModeToggle />
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col justify-between">
          <code className="text-sm text-gray-500 dark:text-gray-300 max-w-96">
            {data.bio}
          </code>
          <div className="flex flex-col gap-y-2 justify-between">
            <div className="flex flex-row items-center gap-x-2">
              <Globe className="text-gray-500 dark:text-gray-300" size={15} />
              <code className="text-sm text-gray-500 dark:text-gray-300">
                {data.location}
              </code>
            </div>
            <div className="flex flex-row gap-1 flex-wrap">
              {data.contact.map((contact) => (
                <Link
                  href={contact.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="icon">
                    <contact.icon className="text-xl pb-1 text-gray-500 dark:text-gray-300" />
                  </Button>
                </Link>
              ))}
              <Link
                href={data.resume_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="outline"
                  className="text-gray-500 dark:text-gray-300"
                >
                  Resume
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="min-h-40 min-w-40">
          <Image
            className="rounded-3xl"
            src={headshot}
            alt="headshot"
            width={160}
            height={160}
          />
        </div>
      </div>
    </div>
  );

  const about = (
    <div className="flex flex-col">
      <div className="text-2xl font-bold tracking-tight">About</div>
      <code className="text-sm text-gray-500 dark:text-gray-300">
        {data.about}
      </code>
    </div>
  );

  const education = (
    <div className="flex flex-col">
      <div className="scroll-m-20 text-2xl font-bold tracking-tight">
        Education
      </div>
      <div className="flex flex-col gap-y-4">
        {data.education.map((edu) => (
          <>
            {/* mobile view */}
            <div className="sm:hidden">
              <div className="flex flex-col gap-y-1">
                <div className="text-lg font-semibold tracking-tight">
                  {edu.title}
                </div>
                <div className="text-sm text-gray-500">{edu.date}</div>
                <code className="text-sm text-gray-500 dark:text-gray-300">
                  {edu.subtitle}
                </code>
              </div>
            </div>
            {/* desktop view */}
            <div className="hidden sm:block">
              <div className="flex flex-row justify-between items-center">
                <div className="text-lg font-semibold tracking-tight">
                  {edu.title}
                </div>
                <div className="text-sm text-gray-500">{edu.date}</div>
              </div>
              <code className="text-sm text-gray-500 dark:text-gray-300">
                {edu.subtitle}
              </code>
            </div>
          </>
        ))}
      </div>
    </div>
  );

  const experience = (
    <div className="flex flex-col">
      <div className="text-2xl font-bold tracking-tight">Work Experience</div>
      <div className="flex flex-col gap-y-4">
        {data.experience.map((exp) => (
          <>
            {/* mobile view */}
            <div className="sm:hidden">
              <div className="flex flex-col gap-y-1">
                <div className="text-lg font-semibold tracking-tight">
                  {exp.company}
                </div>
                <Badge className="rounded-md w-fit">
                  <code>{exp.title}</code>
                </Badge>
                <div className="text-sm text-gray-500">{exp.date}</div>
                <code className="text-sm text-gray-500 dark:text-gray-300">
                  {exp.description}
                </code>
              </div>
            </div>
            {/* desktop view */}
            <div className="hidden sm:block">
              <div className="flex flex-col gap-y-1">
                <div className="flex flex-row justify-between items-center">
                  <div className="text-lg font-semibold tracking-tight">
                    {exp.company}
                  </div>
                  <div className="text-sm text-gray-500">{exp.date}</div>
                </div>
                <Badge className="rounded-md w-fit">
                  <code>{exp.title}</code>
                </Badge>
                <code className="text-sm text-gray-500 dark:text-gray-300">
                  {exp.description}
                </code>
              </div>
            </div>
          </>
        ))}
      </div>
    </div>
  );

  const projects = (
    <div className="flex flex-col">
      <div className="scroll-m-20 text-2xl font-bold tracking-tight mb-2">
        Projects
      </div>
      <div className="flex flex-col gap-y-2">
        {data.projects.map((project) => (
          <Link href={project.link} target="_blank" rel="noopener noreferrer">
            <div className="border border-gray-200 rounded-xl p-3 pl-4 dark:border-gray-800 pb-4 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all	duration-500">
              <div className="text-lg font-bold tracking-tight">
                {project.title}
              </div>
              <div className="leading-tight pb-2">
                <code className="text-sm text-gray-500 dark:text-gray-300">
                  {project.description}
                </code>
              </div>
              <div className="flex flex-row flex-wrap gap-y-1 gap-x-1">
                {project.tags.map((tag) => (
                  <Badge className="rounded-md">
                    <code>{tag}</code>
                  </Badge>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  const skills = (
    <div className="flex flex-col">
      <div className="text-2xl font-bold tracking-tight mb-2">
        Technical Skills
      </div>
      <div className="flex flex-row flex-wrap gap-x-1 gap-y-1">
        {data.skills.map((skill) => (
          <Badge className="rounded-md">
            <code>{skill}</code>
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="flex flex-col gap-y-8 max-w-[700px] border-green-500 p-5">
        {profile}
        {about}
        {education}
        {experience}
        {projects}
        {skills}
      </div>
    </main>
  );
}
