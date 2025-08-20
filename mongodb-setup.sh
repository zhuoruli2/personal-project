#!/bin/bash

echo "Setting up MongoDB with Homebrew..."

# Install MongoDB
echo "Installing MongoDB Community Edition..."
brew tap mongodb/brew
brew install mongodb-community

# Create data directory
echo "Creating MongoDB data directory..."
sudo mkdir -p /usr/local/var/mongodb
sudo mkdir -p /usr/local/var/log/mongodb
sudo chown $(whoami) /usr/local/var/mongodb
sudo chown $(whoami) /usr/local/var/log/mongodb

echo "MongoDB installation complete!"
echo ""
echo "To start MongoDB:"
echo "brew services start mongodb/brew/mongodb-community"
echo ""
echo "To stop MongoDB:"
echo "brew services stop mongodb/brew/mongodb-community"
echo ""
echo "To connect to MongoDB:"
echo "mongosh"