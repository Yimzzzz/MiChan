#!/bin/bash
set -e

echo "Installing Node.js dependencies..."
npm install

echo "Rebuilding native modules for Linux..."
npm rebuild sqlite3

echo "Build complete!"
