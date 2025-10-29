#!/bin/bash
# Force deploy to saraivavision.sanity.studio

# Navigate to sanity directory
cd /home/saraiva-vision-site/sanity

# Deploy and auto-select option 2 (saraivavision.sanity.studio)
echo -e "\n" | npx sanity deploy --yes
