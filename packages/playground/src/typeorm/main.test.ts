import 'reflect-metadata';
import { Entity, Column, PrimaryGeneratedColumn, DataSource, OneToOne, JoinColumn } from 'typeorm';

/**
 *
 */
@Entity()
export class Photo {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    length: 100,
  })
  name!: string;

  @Column('text')
  description!: string;

  @Column()
  filename!: string;

  @Column('double')
  views!: number;

  @Column()
  isPublished!: boolean;
}

/**
 * Photo と1対1で紐づくクラス
 */
@Entity()
export class PhotoMetadata {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('int')
  height?: number;

  @Column('int')
  width?: number;

  @Column()
  orientation?: string;

  @Column()
  compressed?: boolean;

  @Column()
  comment?: string;

  // ここでは、@OneToOne という新しいデコレータを使用しています。
  // type => Photo は、リレーションを作成したいエンティティのクラスを返す関数です。
  // 言語の仕様上、クラスを直接使用するのではなく、クラスを返す関数を使用せざるを得ません。
  // () => Photoと書くこともできますが、コードの可読性を高めるために、慣習としてtype => Photoとしています。なお、type変数自体には何も入れません。
  //
  // また、@JoinColumnデコレーターを追加し、こちら側がリレーションシップを所有することを示します。
  // リレーションには単方向と双方向がある。リレーションは片方だけが所有することができます。リレーションのオーナー側では、@JoinColumnデコレーターの使用が必須となります。
  @OneToOne((type) => Photo)
  @JoinColumn()
  photo?: Photo;
}

const appDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root',
  database: 'root',
  entities: [Photo, PhotoMetadata],
  synchronize: true,
  // SQLのログを出力する
  logging: true,
});

describe('typeormの動作確認', () => {
  beforeAll(async () => {
    await appDataSource.initialize();
  });

  afterAll(async () => {
    await appDataSource.destroy();
  });

  describe('repositoryを使って操作する', () => {
    const repository = appDataSource.getRepository(Photo);

    describe('save', () => {
      it('新規作成の場合はinsertする', async () => {
        const photo = new Photo();
        photo.name = 'Me and Bears';
        photo.description = 'I am near polar bears';
        photo.filename = 'photo-with-bears.jpg';
        photo.views = 2;
        photo.isPublished = true;

        const res = await repository.save(photo);
      });

      it('既存の場合はupdateする', async () => {
        const photo = await repository.findOneBy({ name: 'Me and Bears' });

        photo!.views = 3;
        await repository.save(photo!);
      });
    });

    describe('insert', () => {
      it('存在しない場合はinsertする', async () => {
        const photo = new Photo();
        photo.name = 'Me and Bears';
        photo.description = 'I am near polar bears';
        photo.filename = 'photo-with-bears.jpg';
        photo.views = 2;
        photo.isPublished = true;

        const res = await repository.insert(photo);
      });

      it('既に存在する場合はエラーになる', async () => {
        const photo = await repository.findOneBy({ name: 'Me and Bears' });
        photo!.views = 3;

        await expect(repository.insert(photo!)).rejects.toThrow();
      });
    });

    describe('update', () => {
      it('存在する場合はupdateする', async () => {
        const photo = await repository.findOneBy({ name: 'Me and Bears' });
        photo!.views = 4;

        const res = await repository.update(photo!.id!, { views: 10 });
        console.log(res);
      });

      it('存在しない場合はエラーにはならない', async () => {
        const photo = await repository.findOneBy({ name: 'Me and Bears' });
        photo!.id = 9999;
        photo!.views = 4;

        const res = await repository.update(photo!.id!, { views: 11 });
        console.log(res);
      });
    });

    describe('upsert', () => {
      it('存在する場合はupdateし、なければ作成する', async () => {
        const photo = await repository.findOneBy({ name: 'Me and Bears' });
        photo!.views = 901;

        const photo2 = new Photo();
        photo2.name = 'Me and Bears';
        photo2.description = 'I am near polar bears';
        photo2.filename = 'photo-with-bears.jpg';
        photo2.views = 902;
        photo2.isPublished = true;

        const res = await repository.upsert([photo!, photo2], ['id']);
        console.log(res);
      });
    });
  });

  describe('QueryBuilder', () => {
    it('取得する', async () => {
      // SELECT `photo`.`id` AS `photo_id`, `photo`.`name` AS `photo_name`, `photo`.`description` AS `photo_description`, `photo`.`filename` AS `photo_filename`, `photo`.`views` AS `photo_views`, `photo`.`isPublished` AS `photo_isPublished` FROM `photo` `photo` WHERE `photo`.`id` = ? -- PARAMETERS: [1]
      const photo = await appDataSource
        .getRepository(Photo)
        .createQueryBuilder('photo')
        .where('photo.id = :id', { id: 1 })
        .getOne();

      console.log(photo);
    });

    it('取得する2', async () => {
      // SELECT `photo`.`id` AS `photo_id`, `photo`.`name` AS `photo_name`, `photo`.`description` AS `photo_description`, `photo`.`filename` AS `photo_filename`, `photo`.`views` AS `photo_views`, `photo`.`isPublished` AS `photo_isPublished` FROM `photo` `photo` WHERE `photo`.`id` = ? -- PARAMETERS: [1]
      const photo = await appDataSource
        .createQueryBuilder()
        .from('photo', 'photo')
        .select('photo')
        .where('photo.id = :id', { id: 1 })
        .getOne();

      console.log(photo);
    });

    it('取得する3', async () => {
      // SELECT `photo`.`id` AS `photo_id`, `photo`.`description` AS `photo_description` FROM `photo` `photo` WHERE `photo`.`id` = ? -- PARAMETERS: [1]
      const photo = await appDataSource
        .createQueryBuilder()
        .from('photo', 'photo')
        .select('photo.id')
        .addSelect('photo.description')
        .where('photo.id = :id', { id: 1 })
        .getOne();

      console.log(photo);
    });

    it('leftJoinAndSelect', async () => {
      // SELECT `photo`.`id` AS `photo_id`, `photo`.`name` AS `photo_name`, `photo`.`description` AS `photo_description`, `photo`.`filename` AS `photo_filename`, `photo`.`views` AS `photo_views`, `photo`.`isPublished` AS `photo_isPublished`, `photoMetadata`.`id` AS `photoMetadata_id`, `photoMetadata`.`height` AS `photoMetadata_height`, `photoMetadata`.`width` AS `photoMetadata_width`, `photoMetadata`.`orientation` AS `photoMetadata_orientation`, `photoMetadata`.`compressed` AS `photoMetadata_compressed`, `photoMetadata`.`comment` AS `photoMetadata_comment`, `photoMetadata`.`photoId` AS `photoMetadata_photoId` FROM `photo` `photo` LEFT JOIN `photo_metadata` `photoMetadata` ON `photo`.`id` = `photoMetadata`.`photoId`
      const result = await appDataSource
        .createQueryBuilder(Photo, 'photo')
        .leftJoinAndSelect('photo_metadata', 'photoMetadata', 'photo.id = photoMetadata.photoId')
        .getOne();

      console.log(result);
    });

    describe('insert', () => {
      it('insert', async () => {
        const res = await appDataSource
          .createQueryBuilder()
          .insert()
          .into(Photo)
          // .updateEntity(false)
          .values([
            { name: 'Timber', description: 'Saw', filename: 'aaa.jpg', views: 1, isPublished: true },
            { name: 'Phantom', description: 'Lancer', filename: 'bbb.jpg', views: 2, isPublished: true },
          ])
          .execute();

        console.log(res);
      });

      it('既に存在している場合はエラーになる', async () => {
        const photo = await appDataSource.getRepository(Photo).findOneBy({ name: 'Me and Bears' });
        photo!.views = 3;

        const res = await appDataSource.createQueryBuilder().insert().into(Photo).values(photo!).execute();

        console.log(res);
      });
    });
  });
});
