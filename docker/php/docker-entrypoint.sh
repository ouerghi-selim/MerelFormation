#!/bin/bash

echo "🚀 Starting MerelFormation container..."

# Create necessary directories if they don't exist
echo "📁 Creating necessary directories..."
mkdir -p /var/www/config/jwt
mkdir -p /var/www/var/cache/prod/vich_uploader
mkdir -p /var/www/var/cache/dev/vich_uploader
mkdir -p /var/www/var/cache/prod/jms_metadata
mkdir -p /var/www/var/cache/dev/jms_metadata
mkdir -p /var/www/var/log
mkdir -p /var/www/public/uploads/sessions
mkdir -p /var/www/public/uploads/formations

# Fix permissions for all directories
echo "🔧 Fixing permissions..."
chown -R www-data:www-data /var/www/var
chown -R www-data:www-data /var/www/public/uploads
chown -R www-data:www-data /var/www/config/jwt
chmod -R 777 /var/www/var/cache
chmod -R 777 /var/www/var/log
chmod -R 755 /var/www/public/uploads

# Generate JWT keys if they don't exist
if [ ! -f "/var/www/config/jwt/private.pem" ] || [ ! -f "/var/www/config/jwt/public.pem" ]; then
    echo "🔑 Generating JWT keys..."
    
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
    
    echo "✅ JWT keys generated successfully!"
else
    echo "ℹ️ JWT keys already exist."
fi

# Clear cache if in production and ensure proper permissions after
if [ "${APP_ENV}" = "prod" ]; then
    echo "🗑️ Clearing cache for production..."
    
    # Remove cache first to avoid permission issues
    rm -rf /var/www/var/cache/prod/* 2>/dev/null || true
    
    # Clear cache
    php bin/console cache:clear --env=prod --no-debug 2>/dev/null || echo "⚠️ Cache clear failed, continuing..."
    
    # Fix permissions again after cache clear
    echo "🔧 Re-fixing permissions after cache clear..."
    chown -R www-data:www-data /var/www/var/cache
    chmod -R 777 /var/www/var/cache
fi

echo "✅ Container initialization complete!"

# Execute the original command
exec "$@"
