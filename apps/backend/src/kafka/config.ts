export const KAFKA_CONFIG = {
  brokers: [process.env['KAFKA_BROKERS'] ?? 'localhost:9094'],
  schemaRegistryUrl: process.env['SCHEMA_REGISTRY_URL'] ?? 'http://localhost:8081',
  topics: {
    taskEvents: 'task.events',
  },
  producer: {
    idempotent: true,
    maxInFlightRequests: 5,
  },
} as const;