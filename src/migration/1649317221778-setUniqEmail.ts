import { MigrationInterface, QueryRunner } from 'typeorm';

export class setUniqEmail1649317221778 implements MigrationInterface {
  name = 'setUniqEmail1649317221778';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE "auth"`);
    await queryRunner.query(
      `ALTER TABLE "auth" ADD CONSTRAINT "UQ_b54f616411ef3824f6a5c06ea46" UNIQUE ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth" DROP CONSTRAINT "UQ_b54f616411ef3824f6a5c06ea46"`,
    );
  }
}
