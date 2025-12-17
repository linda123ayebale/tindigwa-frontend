#!/bin/bash

# Script to add Expenses menu item between Payments and Finances in all page sidebars

cd /home/blessing/Projects/Others/tindigwa-frontend/frontend/src/pages

# Find all .jsx files with sidebar definitions
find . -name "*.jsx" -type f -exec grep -l "title: 'Finances'" {} \; | while read file; do
  echo "Updating $file..."
  
  # First, add Receipt to imports if not already there
  if ! grep -q "Receipt" "$file"; then
    # Add Receipt after FileText in the imports
    sed -i '/FileText,/a\  Receipt,' "$file"
  fi
  
  # Add Expenses line before Finances line
  sed -i "/{ title: 'Finances', icon: BarChart3, path: '\/finances' },/i\    { title: 'Expenses', icon: Receipt, path: '/expenses/all' }," "$file"
done

echo "Done! Updated all sidebar definitions."
