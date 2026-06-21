const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'features/products/pages/Catalog.tsx',
  'features/products/pages/ProductDetail.tsx',
  'features/cart/pages/Cart.tsx',
  'features/auth/pages/Auth.tsx',
  'features/auth/pages/Register.tsx',
  'features/auth/pages/ForgotPassword.tsx',
  'features/orders/pages/EditOrderAddress.tsx',
  'features/orders/pages/OrderConfirmation.tsx',
  'features/shared/pages/NotFound.tsx'
];

const srcDir = path.join(process.cwd(), 'src');

filesToUpdate.forEach(relativePath => {
  const filePath = path.join(srcDir, relativePath);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // We only want to change the <main> tag's background
    // Since these files might have multiple <main> tags (e.g. skeleton vs real)
    content = content.replace(/<main([^>]*)dark:bg-\[var\(--bg-surface\)\]([^>]*)>/g, '<main$1dark:bg-[var(--bg-base)]$2>');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated <main> in ${relativePath}`);
  }
});
