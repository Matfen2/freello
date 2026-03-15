import { KafkaClient } from '../kafka/client';
import { KAFKA_CONFIG } from '../kafka/config';

async function createTopics(): Promise<void> {
  const admin = KafkaClient.getInstance().createAdmin();
  await admin.connect();

  await admin.createTopics({
    topics: [
      {
        topic: KAFKA_CONFIG.topics.taskEvents,
        numPartitions: 3,
        replicationFactor: 1,
      },
    ],
    waitForLeaders: true,
  });

  console.log(`✅ Topic '${KAFKA_CONFIG.topics.taskEvents}' created`);
  await admin.disconnect();
}

createTopics().catch((err) => {
  console.error('Failed to create topics:', err);
  process.exit(1);
});