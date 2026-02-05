import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ngoUser = await prisma.user.upsert({
    where: { email: "ngo@example.com" },
    update: {},
    create: {
      name: "NGO Admin",
      email: "ngo@example.com",
      role: "NGO",
      passwordHash: "dev_hash",
    },
  });

  const contributorUser = await prisma.user.upsert({
    where: { email: "contributor@example.com" },
    update: {},
    create: {
      name: "Contributor",
      email: "contributor@example.com",
      role: "CONTRIBUTOR",
      passwordHash: "dev_hash",
    },
  });

  let project = await prisma.project.findFirst({
    where: {
      title: "Community Food Drive",
      ownerId: ngoUser.id,
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        title: "Community Food Drive",
        description: "Coordinate local food donation and distribution.",
        status: "active",
        tags: ["food", "community"],
        ownerId: ngoUser.id,
      },
    });
  }

  let pipeline = await prisma.pipeline.findFirst({
    where: { name: "Planning", projectId: project.id },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        name: "Planning",
        description: "Initial planning and approvals",
        projectId: project.id,
      },
    });
  }

  const existingTask = await prisma.task.findFirst({
    where: {
      title: "Confirm partners",
      projectId: project.id,
    },
  });

  if (!existingTask) {
    await prisma.task.create({
      data: {
        title: "Confirm partners",
        description: "Reach out to partner NGOs and confirm participation.",
        status: "assigned",
        tags: ["outreach"],
        projectId: project.id,
        pipelineId: pipeline.id,
        assigneeId: contributorUser.id,
      },
    });
  }

  const template = await prisma.template.upsert({
    where: { name: "Event Checklist" },
    update: {},
    create: {
      name: "Event Checklist",
      description: "Reusable checklist for NGO events",
    },
  });

  const templateTask = await prisma.templateTask.findFirst({
    where: { title: "Book venue", templateId: template.id },
  });

  if (!templateTask) {
    await prisma.templateTask.create({
      data: {
        title: "Book venue",
        description: "Reserve and confirm the event location.",
        tags: ["logistics"],
        templateId: template.id,
      },
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    throw error;
  });
