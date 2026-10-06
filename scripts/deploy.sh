#!/usr/bin/env bash
# Build and push dompet-web's static files to S3.
#
# Requires the AWS CLI configured with credentials that can write to the
# target bucket. Override BUCKET / AWS_PROFILE as needed:
#   BUCKET=my-other-bucket AWS_PROFILE=dompet-user ./scripts/deploy.sh
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

BUCKET="${BUCKET:-dompet-1731254400}"

npm run build

aws s3 sync dist/ "s3://${BUCKET}" --delete

echo "Deployed to s3://${BUCKET}"
