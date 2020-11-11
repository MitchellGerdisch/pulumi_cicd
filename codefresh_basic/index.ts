import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

import * as fs from 'fs';
import * as path from 'path';

const siteDir = 'www'; // directory for content files

// Get an environment configuration setting if it exists
// use this to modify the index.html for some unique text.
const stack = pulumi.getStack()
const currentTime = new Date().toLocaleTimeString('en-US',{timeZone: 'America/Chicago'})
const webText = `STACK: ${stack}-${currentTime}`

// contentBucket is the S3 bucket that the website's contents will be stored in.
const siteBucket = new aws.s3.Bucket('codefresh-demo-bucket', {
  //bucket: config.targetDomain,
  acl: 'public-read',
  // Configure S3 to serve bucket contents as a website. This way S3 will automatically convert
  // requests for "foo/" to "foo/index.html".
  website: {
    indexDocument: 'index.html',
  },
});

// For each file in the directory, create an S3 object stored in `siteBucket`
for (let item of fs.readdirSync(siteDir)) {
  let filePath = path.join(siteDir, item);
  // A little hack to show different results in the stacks when launched by CI/CD
  fs.readFile(filePath, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var result = data.replace(/PULUMI_ENVIRONMENT/g, webText);
    fs.writeFile(filePath, result, 'utf8', function (err) {
       if (err) return console.log(err);
    });
  });
  let object = new aws.s3.BucketObject(item, {
    bucket: siteBucket,
    acl: 'public-read',
    source: new pulumi.asset.FileAsset(filePath), // use FileAsset to point to a file
    contentType: "text/html"
  });
}

export const contentBucketUri = pulumi.interpolate`s3://${siteBucket.bucket}`;
export const contentBucketWebsiteEndpoint = pulumi.interpolate`http://${siteBucket.websiteEndpoint}`;