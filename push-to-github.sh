#!/bin/bash

# Script to push superhero-dispatch-game to GitHub
# This script will help you create and push to GitHub

echo "🚀 Superhero Dispatch Game - GitHub Setup"
echo "=========================================="
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote 'origin' already exists"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Current remote: $REMOTE_URL"
    echo ""
    read -p "Do you want to use this remote? (y/n): " use_existing
    if [ "$use_existing" != "y" ]; then
        echo "Please remove the existing remote first:"
        echo "  git remote remove origin"
        exit 1
    fi
else
    echo "📝 Please create a GitHub repository first:"
    echo ""
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: superhero-dispatch-game"
    echo "3. Description: Complete React-based Dispatch game clone with 100+ heroes and 10 episodes"
    echo "4. Choose Public or Private"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USERNAME
    
    if [ -z "$GITHUB_USERNAME" ]; then
        echo "❌ GitHub username is required"
        exit 1
    fi
    
    echo ""
    echo "Adding remote repository..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/superhero-dispatch-game.git"
    echo "✅ Remote added"
fi

echo ""
echo "📤 Pushing to GitHub..."
echo ""

# Push to GitHub
if git push -u origin main; then
    echo ""
    echo "✅ Success! Your code has been pushed to GitHub!"
    echo ""
    REMOTE_URL=$(git remote get-url origin)
    REPO_URL=$(echo "$REMOTE_URL" | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
    echo "🌐 View your repository at: $REPO_URL"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   1. Repository doesn't exist on GitHub yet"
    echo "   2. Authentication required (you may need to use a personal access token)"
    echo "   3. Check your internet connection"
    echo ""
    echo "If you need to authenticate, you can:"
    echo "   - Use GitHub Desktop"
    echo "   - Set up SSH keys"
    echo "   - Use a personal access token"
fi

