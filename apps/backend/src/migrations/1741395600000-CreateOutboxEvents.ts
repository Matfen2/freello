import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutboxEvents1741395600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "outbox_events" (
        "id"             UUID              NOT NULL DEFAULT gen_random_uuid(),
        "aggregate_type" VARCHAR(100)      NOT NULL,
        "aggregate_id"   UUID              NOT NULL,
        "event_type"     VARCHAR(100)      NOT NULL,
        "payload"        JSONB             NOT NULL,
        "emitted"        BOOLEAN           NOT NULL DEFAULT FALSE,
        "created_at"     TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
        "emitted_at"     TIMESTAMPTZ,
        CONSTRAINT "PK_outbox_events" PRIMARY KEY ("id")
      )
    `);

    // Index partiel pour que le poller ne scanne que les lignes non émises
    await queryRunner.query(`
      CREATE INDEX "IDX_outbox_events_pending"
      ON "outbox_events" ("created_at" ASC)
      WHERE "emitted" = FALSE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_outbox_events_pending"`);
    await queryRunner.query(`DROP TABLE "outbox_events"`);
  }
}