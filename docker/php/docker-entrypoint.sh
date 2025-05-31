#!/bin/bash

# Create JWT directory if it doesn't exist
mkdir -p /var/www/config/jwt

# Generate JWT keys if they don't exist
if [ ! -f "/var/www/config/jwt/private.pem" ] || [ ! -f "/var/www/config/jwt/public.pem" ]; then
    echo "Generating JWT keys..."
    
    # Get passphrase from environment or use default
    JWT_PASSPHRASE=${JWT_PASSPHRASE:-"3267f4905090f6d6101061ac512ba5f0a839aaa609761f8d2f21645533e879e52"}
    
    # Generate private key with passphrase
    openssl genrsa -aes256 -passout pass:"$JWT_PASSPHRASE" -out /var/www/config/jwt/private.pem 2048
    
    # Generate public key
    openssl rsa -in /var/www/config/jwt/private.pem -passin pass:"$JWT_PASSPHRASE" -pubout -out /var/www/config/jwt/public.pem
    
    # Set proper permissions
    chown www-data:www-data /var/www/config/jwt/private.pem /var/www/config/jwt/public.pem
    chmod 600 /var/www/config/jwt/private.pem
    chmod 644 /var/www/config/jwt/public.pem
    
    echo "JWT keys generated successfully!"
else
    echo "JWT keys already exist."
fi

# Clear cache if in production
if [ "${APP_ENV}" = "prod" ]; then
    echo "Clearing cache for production..."
    php bin/console cache:clear --env=prod --no-debug
fi

# Execute the original command
exec "$@"