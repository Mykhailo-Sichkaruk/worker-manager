import { KubeConfig, BatchV1Api, V1Job } from "@kubernetes/client-node";

const kubeConfig = new KubeConfig();
kubeConfig.loadFromCluster();
const k8sBatchV1Api = kubeConfig.makeApiClient(BatchV1Api);

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
  await k8sBatchV1Api.createNamespacedJob("default", job);
};
