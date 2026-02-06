import prisma from "./prisma";
import type { Prisma } from "@prisma/client";

/**
 * Example transactional operation:
 * - create a project
 * - create an associated task
 * If any step fails, the transaction is rolled back.
 */
export async function createProjectWithTask(projectData: any, taskData: any) {
  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const project = await tx.project.create({ data: projectData });

      // intentionally using tx to ensure all operations run in same transaction
      const task = await tx.task.create({
        data: {
          ...taskData,
          projectId: project.id,
        },
      });

      return { project, task };
    });

    return result;
  } catch (error) {
    // handle/log error; Prisma will rollback automatically on error
    console.error("Transaction failed; rolled back.", error);
    throw error;
  }
}

/**
 * Sample function to demonstrate rollback by forcing an error
 */
export async function createProjectThenFail(projectData: any) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const project = await tx.project.create({ data: projectData });

      // this will fail (null title) and trigger a rollback example
      await tx.task.create({
        data: {
          title: null as any,
          description: "This will fail",
          projectId: project.id,
        },
      });
    });
  } catch (error) {
    console.error("Expected failure — transaction rolled back.", error);
  }
}
