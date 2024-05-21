import { log } from "#infrastructure/log.js";
import { KubeConfig, BatchV1Api, V1Job } from "@kubernetes/client-node";

const NAMESPACE = "thesis";

const kubeConfig = new KubeConfig();
kubeConfig.loadFromCluster();
const k8sBatchV1Api = kubeConfig.makeApiClient(BatchV1Api);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const scheduleTestJob = async (jobName: string, dockerImage: string) => {
  const job: V1Job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: { name: jobName },
    spec: {
      template: {
        spec: {
          containers: [
            {
              name: "test-container",
              image: dockerImage,
              command: ["sh", "-c", "echo Starting test... && sleep 30"],
            },
          ],
          restartPolicy: "Never",
        },
      },
      backoffLimit: 4,
    },
  };

  try {
    log.info(`Starting test image ${jobName} with image ${dockerImage}`);
    await k8sBatchV1Api.createNamespacedJob(NAMESPACE, job);
    log.info(`Job ${jobName} created, waiting for completion...`);

    // Polling to check job status
    let completed = false;
    while (!completed) {
      await delay(5000); // Wait for 5 seconds before checking the job status again

      const res = await k8sBatchV1Api.readNamespacedJobStatus(
        jobName,
        NAMESPACE,
      );
      const jobStatus = res.body.status;

      if (jobStatus?.succeeded) {
        log.info(`Job ${jobName} completed successfully.`);
        completed = true;
      } else if (
        jobStatus?.failed &&
        jobStatus.failed >= (job.spec?.backoffLimit ?? 0)
      ) {
        log.info(`Job ${jobName} failed after ${jobStatus.failed} attempts.`);
        completed = true;
      }
    }

    // Deleting the job
    await k8sBatchV1Api.deleteNamespacedJob(
      jobName,
      NAMESPACE,
      undefined,
      undefined,
      0,
      true,
      "Background",
    );
    log.info(`Job ${jobName} deleted.`);
  } catch (error) {
    log.error(`Error scheduling job ${jobName}: ${error}`);
  }
};
