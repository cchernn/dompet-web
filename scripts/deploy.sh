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

# index.html references the current build's content-hashed filenames
# under assets/ -- if it's left cacheable, CloudFront or a browser can
# keep serving a stale index.html after a later deploy's --delete removes
# the old hashed files it points to, causing a 404 on load. So everything
# OUTSIDE assets/ (index.html, vite.svg, ...) must always revalidate,
# while assets/ itself is safe to cache forever -- its filenames change
# whenever their content does.
aws s3 sync dist/assets/ "s3://${BUCKET}/assets" --delete \
    --cache-control "public, max-age=31536000, immutable"

aws s3 sync dist/ "s3://${BUCKET}" --delete \
    --exclude "assets/*" \
    --cache-control "no-cache, no-store, must-revalidate"

echo "Deployed to s3://${BUCKET}"
