import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GithubFilled, LinkedinFilled, MailOutlined } from "@ant-design/icons";
import Image from "next/image";
import headshot from "../assets/headshot-main.png";
import { data } from "../assets/data";
import Link from "next/link";
import { Globe, GlobeIcon, MailIcon, PhoneIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export default function Home() {
  const profile = (
    <div>
      <div className="flex flex-row justify-between items-center">
        <div className="scroll-m-20 text-3xl font-bold tracking-tight">
          Jordan Ali Hilado
        </div>
        <ModeToggle />
      </div>
      <div className="flex flex-row items-center">
        <div className="flex flex-col gap-y-2 justify-between">
          <code className="text-md text-gray-500 dark:text-gray-300">
            {data.bio}
          </code>
          <div className="flex flex-row items-center gap-x-2">
            <Globe className="text-gray-500 dark:text-gray-300" size={15} />
            <code className="text-sm text-gray-500 dark:text-gray-300">
              {data.location}
            </code>
          </div>
          <div className="flex flex-row gap-1">
            <Link
              href={data.email_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon">
                <MailOutlined className="text-xl pb-1 text-gray-500 dark:text-gray-300" />
              </Button>
            </Link>
            <Link
              href={data.linkedin_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon">
                <LinkedinFilled className="text-xl pb-1 text-gray-500 dark:text-gray-300" />
              </Button>
            </Link>
            <Link
              href={data.github_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon">
                <GithubFilled className="text-xl pb-1 text-gray-500 dark:text-gray-300" />
              </Button>
            </Link>
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
        <Image
          className="rounded-3xl"
          src={headshot}
          alt="headshot"
          width={150}
        />
      </div>
    </div>
  );

  const about = (
    <>
      <div className="flex flex-col">
        <div className="text-2xl font-bold tracking-tight">About</div>
        <code className="text-md text-gray-500 dark:text-gray-300">
          {data.about}
        </code>
      </div>
    </>
  );

  const education = (
    <>
      <div className="flex flex-col">
        <div className="scroll-m-20 text-2xl font-bold tracking-tight">
          Education
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="text-lg font-semibold tracking-tight my-2">
            California State University, Long Beach
          </div>
          <div className="text-sm text-gray-500">2020 - 2023</div>
        </div>
        <code className="text-sm text-gray-500 dark:text-gray-300">
          B.S. Computer Science
        </code>
      </div>
    </>
  );

  const experience = (
    <>
      <div className="flex flex-col">
        <div className="text-2xl font-bold tracking-tight">Work Experience</div>
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row justify-between items-center">
            <div className="text-lg font-semibold tracking-tight my-2 mr-2">
              Walt Disney Animation Studios
            </div>
            <Badge className="rounded-md">
              <code>Software Engineer Intern</code>
            </Badge>
          </div>
          <div className="text-sm text-gray-500">May 2023 - Aug 2023</div>
        </div>
        <code className="text-sm text-gray-500 dark:text-gray-300">
          Second internship with the Information Services team where I built a
          full-stack web application for production management
        </code>
      </div>
    </>
  );

  const projects = (
    <>
      <div className="flex flex-col">
        <div className="scroll-m-20 text-2xl font-bold tracking-tight mb-2">
          Projects
        </div>
        <div className="border border-gray-200 rounded-xl p-3 pl-4 dark:border-gray-800 pb-4">
          <div className="text-lg font-bold tracking-tight">Project 1</div>
          <div className="leading-tight pb-2">
            <code className="text-sm text-gray-500 dark:text-gray-300">
              Second internship with the Information Services team where I built
              a full-stack web application for production management
            </code>
          </div>
          <div className="flex flex-row gap-x-1">
            <Badge className="rounded-md">
              <code>llm</code>
            </Badge>
            <Badge className="rounded-md">
              <code>pytorch</code>
            </Badge>
          </div>
        </div>
      </div>
    </>
  );

  const skills = (
    <>
      <div className="flex flex-col">
        <div className="text-2xl font-bold tracking-tight mb-2">
          Technical Skills
        </div>
        <div className="flex flex-row gap-x-1">
          <Badge className="rounded-md">
            <code>Python</code>
          </Badge>
          <Badge className="rounded-md">
            <code>Java</code>
          </Badge>
        </div>
      </div>
    </>
  );

  return (
    // <main className="flex min-h-screen flex-col items-center justify-between p-24">
    //   <div className="flex flex-col gap-y-8 max-w-[700px] border-green-500">
    //     {profile}
    //     {about}
    //     {education}
    //     {experience}
    //     {projects}
    //     {skills}
    //   </div>
    // </main>
    <main className="container relative mx-auto scroll-my-12 overflow-auto p-4 print:p-12 md:p-16">
      <section className="mx-auto w-full max-w-2xl space-y-8 bg-white print:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 space-y-1.5">
            <h1 className="text-2xl font-bold">{RESUME_DATA.name}</h1>
            <p className="max-w-md text-pretty font-mono text-sm text-muted-foreground">
              {RESUME_DATA.about}
            </p>
            <p className="max-w-md items-center text-pretty font-mono text-xs text-muted-foreground">
              <a
                className="inline-flex gap-x-1.5 align-baseline leading-none hover:underline"
                href={RESUME_DATA.locationLink}
                target="_blank"
              >
                <GlobeIcon className="size-3" />
                {RESUME_DATA.location}
              </a>
            </p>
            <div className="flex gap-x-1 pt-1 font-mono text-sm text-muted-foreground print:hidden">
              {RESUME_DATA.contact.email ? (
                <Button
                  className="size-8"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a href={`mailto:${RESUME_DATA.contact.email}`}>
                    <MailIcon className="size-4" />
                  </a>
                </Button>
              ) : null}
              {RESUME_DATA.contact.tel ? (
                <Button
                  className="size-8"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a href={`tel:${RESUME_DATA.contact.tel}`}>
                    <PhoneIcon className="size-4" />
                  </a>
                </Button>
              ) : null}
              {RESUME_DATA.contact.social.map((social) => (
                <Button
                  key={social.name}
                  className="size-8"
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a href={social.url}>
                    <social.icon className="size-4" />
                  </a>
                </Button>
              ))}
            </div>
            <div className="hidden flex-col gap-x-1 font-mono text-sm text-muted-foreground print:flex">
              {RESUME_DATA.contact.email ? (
                <a href={`mailto:${RESUME_DATA.contact.email}`}>
                  <span className="underline">{RESUME_DATA.contact.email}</span>
                </a>
              ) : null}
              {RESUME_DATA.contact.tel ? (
                <a href={`tel:${RESUME_DATA.contact.tel}`}>
                  <span className="underline">{RESUME_DATA.contact.tel}</span>
                </a>
              ) : null}
            </div>
          </div>

          <Avatar className="size-28">
            <AvatarImage alt={RESUME_DATA.name} src={RESUME_DATA.avatarUrl} />
            <AvatarFallback>{RESUME_DATA.initials}</AvatarFallback>
          </Avatar>
        </div>
        <Section>
          <h2 className="text-xl font-bold">About</h2>
          <p className="text-pretty font-mono text-sm text-muted-foreground">
            {RESUME_DATA.summary}
          </p>
        </Section>
        <Section>
          <h2 className="text-xl font-bold">Work Experience</h2>
          {RESUME_DATA.work.map((work) => {
            return (
              <Card key={work.company}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-x-2 text-base">
                    <h3 className="inline-flex items-center justify-center gap-x-1 font-semibold leading-none">
                      <a className="hover:underline" href={work.link}>
                        {work.company}
                      </a>

                      <span className="inline-flex gap-x-1">
                        {work.badges.map((badge) => (
                          <Badge
                            variant="secondary"
                            className="align-middle text-xs"
                            key={badge}
                          >
                            {badge}
                          </Badge>
                        ))}
                      </span>
                    </h3>
                    <div className="text-sm tabular-nums text-gray-500">
                      {work.start} - {work.end}
                    </div>
                  </div>

                  <h4 className="font-mono text-sm leading-none">
                    {work.title}
                  </h4>
                </CardHeader>
                <CardContent className="mt-2 text-xs">
                  {work.description}
                </CardContent>
              </Card>
            );
          })}
        </Section>
        <Section>
          <h2 className="text-xl font-bold">Education</h2>
          {RESUME_DATA.education.map((education) => {
            return (
              <Card key={education.school}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-x-2 text-base">
                    <h3 className="font-semibold leading-none">
                      {education.school}
                    </h3>
                    <div className="text-sm tabular-nums text-gray-500">
                      {education.start} - {education.end}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-2">{education.degree}</CardContent>
              </Card>
            );
          })}
        </Section>
        <Section>
          <h2 className="text-xl font-bold">Skills</h2>
          <div className="flex flex-wrap gap-1">
            {RESUME_DATA.skills.map((skill) => {
              return <Badge key={skill}>{skill}</Badge>;
            })}
          </div>
        </Section>

        <Section className="print-force-new-page scroll-mb-16">
          <h2 className="text-xl font-bold">Projects</h2>
          <div className="-mx-3 grid grid-cols-1 gap-3 print:grid-cols-3 print:gap-2 md:grid-cols-2 lg:grid-cols-3">
            {RESUME_DATA.projects.map((project) => {
              return (
                <ProjectCard
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  tags={project.techStack}
                  link={"link" in project ? project.link.href : undefined}
                />
              );
            })}
          </div>
        </Section>
      </section>

      <CommandMenu
        links={[
          {
            url: RESUME_DATA.personalWebsiteUrl,
            title: "Personal Website",
          },
          ...RESUME_DATA.contact.social.map((socialMediaLink) => ({
            url: socialMediaLink.url,
            title: socialMediaLink.name,
          })),
        ]}
      />
    </main>
  );
}
