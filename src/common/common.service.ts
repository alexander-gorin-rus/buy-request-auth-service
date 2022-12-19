import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

export class CommonService {
  protected serviceRepo: Repository<any>;
  constructor(service: Repository<any>) {
    this.serviceRepo = service;
  }

  protected findOne<R>(criteria: FindManyOptions): Promise<R> {
    return this.serviceRepo.findOne(criteria);
  }

  protected findByCriteria<R>(criteria: FindManyOptions): Promise<R[]> {
    return this.serviceRepo.find(criteria);
  }

  protected findOneByCriteria<R>(criteria: FindOneOptions): Promise<R> {
    return this.serviceRepo.findOne(criteria);
  }

  protected async remove(id: string): Promise<void> {
    await this.serviceRepo.delete(id);
  }

  protected async save<E, R>(obj: E): Promise<R> {
    return this.serviceRepo.save(obj);
  }

  protected findAndCountByCriteria<R>(
    criteria: FindManyOptions,
  ): Promise<[R[], number]> {
    return this.serviceRepo.findAndCount(criteria);
  }
}
