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

(async () => {
  // データベースとの最初の接続を初期化し、すべてのエンティティを登録します。
  // データベーススキーマを「同期」させ、新しく作成されたデータベースの "initialize()" メソッドを呼び出します。
  await appDataSource.initialize();

  // await entityManager()

  // await repository();

  await saveOneToOneRelation();

  await appDataSource.destroy();
})();

async function entityManager() {
  const photo = new Photo();
  photo.name = 'Me and Bears';
  photo.description = 'I am near polar bears';
  photo.filename = 'photo-with-bears.jpg';
  photo.views = 1;
  photo.isPublished = true;

  // エンティティが保存されると、新しく生成されたidを取得します。
  // saveメソッドは、渡したオブジェクトと同じインスタンスを返します。
  // これはオブジェクトの新しいコピーではなく、そのidを変更して返します。
  await appDataSource.manager.save(photo);
  console.log('Photo has been saved. Photo id is', photo.id);

  // エンティティマネージャーを使うと、アプリ内の任意のエンティティを操作することができます。
  // 例えば、保存したエンティティをロードしてみましょう。
  const savedPhotos = await appDataSource.manager.find(Photo);
  console.log('All photos from the db: ', savedPhotos);
}

async function repository() {
  const photo = new Photo();
  photo.name = 'Me and Bears';
  photo.description = 'I am near polar bears';
  photo.filename = 'photo-with-bears.jpg';
  photo.views = 1;
  photo.isPublished = true;

  const photoRepository = appDataSource.getRepository(Photo);

  await photoRepository.save(photo);
  console.log('Photo has been saved');

  const savedPhotos = await photoRepository.find();
  console.log('All photos from the db: ', savedPhotos);

  // 複数のレコードがある場合は最小の1件を取得する
  const meAndBearsPhoto = await photoRepository.findOneBy({
    name: 'Me and Bears',
  });
  console.log('Me and Bears photo from the db: ', meAndBearsPhoto);
}

async function saveOneToOneRelation() {
  // create a photo
  const photo = new Photo();
  photo.name = 'Me and Bears';
  photo.description = 'I am near polar bears';
  photo.filename = 'photo-with-bears.jpg';
  photo.views = 1;
  photo.isPublished = true;

  // create a photo metadata
  const metadata = new PhotoMetadata();
  metadata.height = 640;
  metadata.width = 480;
  metadata.compressed = true;
  metadata.comment = 'cybershoot';
  metadata.orientation = 'portrait';
  metadata.photo = photo; // this way we connect them

  // get entity repositories
  const photoRepository = appDataSource.getRepository(Photo);
  const metadataRepository = appDataSource.getRepository(PhotoMetadata);

  // first we should save a photo
  await photoRepository.save(photo);

  // photo is saved. Now we need to save a photo metadata
  const res = await metadataRepository.save(metadata);

  // done
  console.log('Metadata is saved, and the relation between metadata and photo is created in the database too');

  // photoはundefinedになっている。
  console.log(await metadataRepository.findBy({ id: res.id }));

  // こんな感じにするととれる
  console.log(
    await metadataRepository.find({
      relations: {
        photo: true,
      },
      where: { id: res.id },
    })
  );
}
