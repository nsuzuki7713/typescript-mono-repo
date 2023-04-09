import { DataSource } from 'typeorm';
import { Photo } from './entities/photo';
import { PhotoMetadata } from './entities/photoMetadata';

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

// (async () => {
//   // データベースとの最初の接続を初期化し、すべてのエンティティを登録します。
//   // データベーススキーマを「同期」させ、新しく作成されたデータベースの "initialize()" メソッドを呼び出します。
//   await appDataSource.initialize();

//   const photo = new Photo();
//   photo.name = 'Me and Bears';
//   photo.description = 'I am near polar bears';
//   photo.filename = 'photo-with-bears.jpg';
//   photo.views = 1;
//   photo.isPublished = true;

//   const photoRepository = appDataSource.getRepository(Photo);

//   await photoRepository.save(photo);

//   await appDataSource.destroy();
// })();

export async function getDataSource() {
  if (!appDataSource.isInitialized) {
    await appDataSource.initialize();
  }

  return appDataSource;
}

export async function destoryDataSource() {
  await appDataSource.destroy();
}
