#!/bin/bash

# Setup script for WordPress External Integration planning

# Generate JSON output with planning parameters
cat << 'EOF'
{
  "FEATURE_SPEC": "/home/saraiva-vision-site/specs/005-wordpress-external-integration/feature-spec.md",
  "IMPL_PLAN": "/home/saraiva-vision-site/specs/005-wordpress-external-integration/implementation-plan.md",
  "SPECS_DIR": "/home/saraiva-vision-site/specs/005-wordpress-external-integration",
  "BRANCH": "feature/wordpress-external-integration"
}
EOF