import { v4 } from 'uuid';
import { GcpBucket } from './main';

describe('GcpBucket', () => {
  const gcpBucket = new GcpBucket();

  describe.skip('createBucket', () => {
    const bucketName = `test-bucket-${v4()}`;

    afterEach(async () => {
      await gcpBucket.deleteBucket(bucketName);
    });

    it('引数で指定したバケット名で新規作成する', async () => {
      await gcpBucket.createBucket(bucketName, { location: 'asia-northeast1' });

      await expect(gcpBucket.exists(bucketName)).resolves.toEqual([true]);
    });

    it('既に存在しているバケット名を指定した場合、エラーを返す', async () => {
      await gcpBucket.createBucket(bucketName, { location: 'asia-northeast1' });

      await expect(gcpBucket.createBucket(bucketName, { location: 'asia-northeast1' })).rejects.toThrow();
    });
  });

  describe.skip('getBucketNames', () => {
    const bucketNames = [...Array(2).keys()].map(() => `test-bucket-${v4()}`);

    beforeEach(async () => {
      await Promise.all(bucketNames.map((bucketName) => gcpBucket.createBucket(bucketName)));
    });

    afterEach(async () => {
      await Promise.all(bucketNames.map((bucketName) => gcpBucket.deleteBucket(bucketName)));
    });

    it('バケットの一覧名を取得する', async () => {
      const buckets = await gcpBucket.getBuckets();

      expect(buckets.map((bucket) => bucket.name)).toEqual(expect.arrayContaining(bucketNames));
    });
  });

  describe.skip('getBucket', () => {
    const bucketName = `test-bucket-${v4()}`;

    beforeAll(async () => {
      await gcpBucket.createBucket(bucketName);
    });

    afterAll(async () => {
      await gcpBucket.deleteBucket(bucketName);
    });

    it('引数で指定したバケットを取得する', async () => {
      const [bucket] = await gcpBucket.getBucket(bucketName);

      expect(bucket.name).toBe(bucketName);
    });

    it('存在しないバケットを指定したらエラーになる', async () => {
      await expect(gcpBucket.getBucket('not-found-bucket')).rejects.toThrow();
    });
  });

  describe.skip('deleteBucket', () => {
    it('引数で指定したバケットを削除する', async () => {
      const bucketName = `test-bucket-${v4()}`;
      await gcpBucket.createBucket(bucketName);

      await gcpBucket.deleteBucket(bucketName);

      await expect(gcpBucket.exists(bucketName)).resolves.toEqual([false]);
    });

    it('存在しないバケットを指定した場合、エラーになる', async () => {
      await expect(gcpBucket.deleteBucket('not-found-bucket')).rejects.toThrow();
    });
  });

  describe.skip('exists', () => {
    const bucketName = `test-bucket-${v4()}`;

    beforeAll(async () => {
      await gcpBucket.createBucket(bucketName);
    });

    afterAll(async () => {
      await gcpBucket.deleteBucket(bucketName);
    });

    it('引数でしたバケットが存在する場合、trueを返す', async () => {
      await expect(gcpBucket.exists(bucketName)).resolves.toEqual([true]);
    });

    it('引数でしたバケットが存在しない場合、falseを返す', async () => {
      await expect(gcpBucket.exists('not-found-bucket')).resolves.toEqual([false]);
    });
  });
});
