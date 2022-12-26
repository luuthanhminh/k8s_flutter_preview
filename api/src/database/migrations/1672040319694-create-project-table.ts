import { MigrationInterface, QueryRunner } from 'typeorm';

export class createProjectTable1672040319694 implements MigrationInterface {
  name = 'createProjectTable1672040319694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "project_name" character varying NOT NULL, "bucket_name" character varying NOT NULL, "domain" character varying NOT NULL, "is_deployed" boolean, CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "projects"`);
  }
}
