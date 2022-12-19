import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCodeCreatedAt1654086506836 implements MigrationInterface {
  name = 'addCodeCreatedAt1654086506836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth" ADD "codeCreatedAt" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "codeCreatedAt"`);
  }
}
