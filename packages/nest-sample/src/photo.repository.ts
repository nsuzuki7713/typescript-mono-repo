import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Photo } from './mysql/entities/photo';
import { getDataSource } from './mysql/dataSource';

export interface PhotoRepository {
  create(): Promise<void>;
}

@Injectable()
export class PhotoRepositoryService implements PhotoRepository {
  private photoRepository: Repository<Photo>;

  async create(): Promise<void> {
    this.photoRepository = (await getDataSource()).getRepository(Photo);

    console.log('bbbb');

    const photo = new Photo();
    photo.name = 'Me and Bears';
    photo.description = 'I am near polar bears';
    photo.filename = 'photo-with-bears.jpg';
    photo.views = 1;
    photo.isPublished = true;

    await this.photoRepository.save(photo);
  }
}
