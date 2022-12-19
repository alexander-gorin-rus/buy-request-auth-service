import { MigrationInterface, QueryRunner } from 'typeorm';

export class addCodeColumn1653391778018 implements MigrationInterface {
  name = 'addCodeColumn1653391778018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" ADD "code" character varying`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "code"`);
  }
}
