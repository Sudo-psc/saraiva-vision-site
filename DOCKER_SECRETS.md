# Docker Secrets Configuration Example
#
# For Docker Swarm production deployment using secrets
#
# Usage:
# 1. Create secrets: echo "secret_value" | docker secret create secret_name -
# 2. Deploy with: docker stack deploy -c docker-compose.prod.yml saraiva-vision
#
# Secrets to create:
# - github_token
# - google_maps_api_key
# - google_places_api_key
# - supabase_url
# - supabase_key
# - gtm_id
# - ga_measurement_id
# - recaptcha_site_key
# - recaptcha_secret
# - mysql_root_password
# - mysql_password
# - redis_password

# Example commands to create secrets:
# echo "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" | docker secret create github_token -
# echo "AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms" | docker secret create google_maps_api_key -
# echo "ChIJVUKww7WRugARF7u2lAe7BeE" | docker secret create google_place_id -
# echo "https://yluhrvsqdohxcnwwrekz.supabase.co" | docker secret create supabase_url -
# echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | docker secret create supabase_key -
# echo "GTM-KF2NP85D" | docker secret create gtm_id -
# echo "G-LXWRK8ELS6" | docker secret create ga_measurement_id -
# echo "6LfdgsArAAAAAPn9PDsPz23Jp9CbNrB2RSLxm86_" | docker secret create recaptcha_site_key -
# echo "6LfdgsArAAAAAPhbnOClaPp_uzXw17mhXNQPWOvb" | docker secret create recaptcha_secret -
# echo "secure_root_password" | docker secret create mysql_root_password -
# echo "secure_wordpress_password" | docker secret create mysql_password -
# echo "secure_redis_password" | docker secret create redis_password -

# In docker-compose.prod.yml, reference secrets like:
# secrets:
#   - github_token
#   - google_maps_api_key
# environment:
#   GITHUB_TOKEN: /run/secrets/github_token
#   GOOGLE_MAPS_API_KEY: /run/secrets/google_maps_api_key