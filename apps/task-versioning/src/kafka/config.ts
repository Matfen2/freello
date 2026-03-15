export const kafkaConfig = {
  bootstrapServers: process.env['KAFKA_BROKERS'] ?? 'localhost:9094',
  schemaRegistryUrl: process.env['SCHEMA_REGISTRY_URL'] ?? 'http://localhost:8081',
  topics: {
    taskEvents: 'task.events',
  },
  consumerGroup: 'freello-task-versioning',
} as const;