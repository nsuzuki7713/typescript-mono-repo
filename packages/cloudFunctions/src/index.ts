import * as functions from 'firebase-functions';
import * as functionsV1 from 'firebase-functions/v1';
import * as functionsV2 from 'firebase-functions/v2';

export const helloWorld = functions
  .region('asia-northeast1')
  .runWith({ memory: '512MB' })
  .https.onRequest((request, response) => {
    functions.logger.info('Hello logs!', { structuredData: true });
    response.send('Hello from Firebase!');
  });

export const helloWorldV1 = functionsV1
  .region('asia-northeast1')
  .runWith({ memory: '512MB' })
  .https.onRequest((request, response) => {
    functionsV1.logger.info('Hello logs V1!', { structuredData: true });
    response.send('Hello from Firebase V1!');
  });

// function名のルールがV2とV1でことなる。
// https://github.com/firebase/firebase-tools/blob/5ea735ec96eec1eb4d016ea447e092dadbec7481/src/deploy/functions/validate.ts#L147
export const helloworldv2 = functionsV2.https.onRequest(
  { region: 'asia-northeast1', memory: '512MiB' },
  (request, response) => {
    functionsV2.logger.info('Hello logs!', { structuredData: true });
    response.send('Hello from Firebase V2!');
  }
);
