import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Readable, Stream } from 'stream';

const s3 = new S3Client({});

// リサイズ後の画像の幅
const widths = [240, 300, 460, 700, 1040];

// バケット名とファイル名を指定
const bucketName = 'line-image-20230406';
const originalKey = 'onepiece01_luffy2.png';
const resizedKey = `onepiece01_luffy2`;

const resizeImage = async () => {
  try {
    // S3からオリジナル画像をダウンロード
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucketName, Key: originalKey }));

    const buf = await streamToBuffer(Body as Readable);

    // sharpを使用して画像をリサイズ
    await Promise.all(
      widths.map(async (width) => {
        const resizedBuffer = await sharp(buf).resize(width).toFormat('png').toBuffer();

        // リサイズされた画像をS3に保存
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: `${resizedKey}/${width}`,
            Body: resizedBuffer,
            ContentType: 'image/png',
          })
        );
      })
    );

    console.log(`Resized image saved`);
  } catch (error) {
    console.error(error);
  }
};

resizeImage().catch((e) => console.log(e));

const streamToBuffer = async (stream: Stream): Promise<Uint8Array> => {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk: Uint8Array) => {
      return chunks.push(chunk);
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};
