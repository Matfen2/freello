import { VersioningProcessor } from './versioning/VersioningProcessor';

const processor = new VersioningProcessor();

async function main(): Promise<void> {
  await processor.start();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down...');
  await processor.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received — shutting down...');
  await processor.stop();
  process.exit(0);
});

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});