const fs = require('fs');

// Read the blogPosts.js file
const content = fs.readFileSync('src/data/blogPosts.js', 'utf8');

// Extract posts with regex
const posts = [];
const postRegex = /{\s*id:\s*(\d+),\s*title:\s*['"](.*?)['"],[\s\S]*?image:\s*['"](.*?)['"]/g;

let match;
while ((match = postRegex.exec(content)) !== null) {
  const [, id, title, image] = match;
  posts.push({ id, title, image });
}

console.log('Posts with images:');
posts.forEach(p => {
  const imageExists = fs.existsSync(`public${p.image}`);
  const status = imageExists ? '✓' : '✗';
  console.log(`${status} ID ${p.id}: ${p.title.substring(0, 50)}... → ${p.image}`);
});

console.log(`\nTotal: ${posts.length} posts`);

// Count posts without images
const totalPosts = (content.match(/{\s*id:\s*\d+,/g) || []).length;
const postsWithoutImages = totalPosts - posts.length;

if (postsWithoutImages > 0) {
  console.log(`\nPosts WITHOUT images: ${postsWithoutImages}`);
}
