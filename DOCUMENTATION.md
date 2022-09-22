# Documentation of the AWS Architecture


## AWS S3 Bucket

### "bifrost-webapp-hosting-production" (Dev: "bifrost-webapp-hosting")

Select Region "US East (N. Virginia)".
Uncheck "Block all public access" (Bucket needs to be public).
Then click on "Create bucket".

Once created, open it and go to the tab "Properties", scroll down to "Static website hosting" and click Edit.
- Static website hosting: Enable
- Hosting type: Host a statis website
- Index document: index.html
- Error document: index.html


## AWS CLOUDFRONT

### DISTRIBUTION FOR S3

Add new Distribution (Web) with following settings:
- Origin Domain Name: bifrost-webapp-hosting-production.s3-website-us-east-1.amazonaws.com
- Viewer Protocol Policy: Redirect HTTP to HTTPS
- Compress Object Automatically: Yes
- Price Class: Use All Edge Locations

Add the following Bucket policy:
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::bifrost-webapp-hosting-production/*"
      }
    ]
  }