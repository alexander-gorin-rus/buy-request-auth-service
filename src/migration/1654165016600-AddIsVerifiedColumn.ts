import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVerifiedColumn1654165016600 implements MigrationInterface {
  name = 'AddIsVerifiedColumn1654165016600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "auth" ADD "isVerified" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "isVerified"`);
  }
}
