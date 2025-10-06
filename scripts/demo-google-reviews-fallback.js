#!/usr/bin/env node

/**
 * Demo script to showcase the improved Google Reviews fallback system
 * This script simulates different scenarios to test the fallback behavior
 */

// Mock browser environment for testing
global.window = {
  localStorage: {
    data: {},
    getItem: function(key) {
      return this.data[key] || null;
    },
    setItem: function(key, value) {
      this.data[key] = value;
    },
    removeItem: function(key) {
      delete this.data[key];
    },
    clear: function() {
      this.data = {};
    }
  }
};

// Mock GoogleReviewsStorage import
let GoogleReviewsStorage;

async function initializeStorage() {
  try {
    // Dynamic import similar to the component
    const module = await import('../src/utils/googleReviewsStorage.js');
    GoogleReviewsStorage = module.default;
    console.log('✅ GoogleReviewsStorage loaded successfully');
  } catch (error) {
    console.error('❌ Failed to load GoogleReviewsStorage:', error);
    process.exit(1);
  }
}

// Test data
const sampleReviews = [
  {
    id: 'review-1',
    author: 'Maria Silva',
    avatar: '/images/avatar-female-blonde-640w.avif',
    rating: 5,
    text: 'Atendimento excelente! Profissionais muito qualificados e espaço maravilhoso.',
    createTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review-2',
    author: 'João Santos',
    avatar: '/images/avatar-male-640w.avif',
    rating: 5,
    text: 'Consulta muito bem conduzida. Dr. Saraiva é extremamente atencioso.',
    createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review-3',
    author: 'Ana Costa',
    avatar: '/images/avatar-female-brunette-640w.avif',
    rating: 4,
    text: 'Ótima experiência, equipe super prestativa. Recomendo!',
    createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const sampleStats = {
  overview: {
    averageRating: 4.8,
    totalReviews: 156
  }
};

const samplePlaceData = {
  name: 'Clínica Saraiva Vision',
  rating: 4.8,
  userRatingCount: 156,
  reviews: sampleReviews,
  formattedAddress: 'R. Exemplo, 123 - São Paulo, SP',
  url: 'https://maps.google.com/place?id=example',
  fetchedAt: new Date().toISOString()
};

// Demo scenarios
async function demoScenario1() {
  console.log('\n📋 SCENARIO 1: Fresh API Response');
  console.log('=' .repeat(50));

  // Clear any existing data
  GoogleReviewsStorage.clearCache();

  // Simulate successful API response
  console.log('🔄 Simulating successful Google Reviews API response...');

  const success = GoogleReviewsStorage.saveReviewsData(
    sampleReviews,
    sampleStats,
    'test-place-id'
  );

  if (success) {
    console.log('✅ Reviews data saved successfully');
    console.log(`💾 Saved ${sampleReviews.length} reviews`);
    console.log(`⭐ Average rating: ${sampleStats.overview.averageRating}`);
    console.log(`📊 Total reviews: ${sampleStats.overview.totalReviews}`);
  }

  // Save place data
  const placeSuccess = GoogleReviewsStorage.savePlaceData(
    samplePlaceData,
    'test-place-id'
  );

  if (placeSuccess) {
    console.log('✅ Place data saved successfully');
  }

  // Check cache status
  console.log('\n📊 Cache Status:');
  console.log(`✅ Valid cache: ${GoogleReviewsStorage.hasValidCache()}`);
  console.log(`✅ Fallback data: ${GoogleReviewsStorage.hasFallbackData()}`);
}

async function demoScenario2() {
  console.log('\n📋 SCENARIO 2: API Error with Fallback Available');
  console.log('=' .repeat(50));

  // Simulate API error but we have cached data
  console.log('❌ Simulating Google Reviews API error...');
  console.log('🔍 Checking for cached data...');

  const cachedData = GoogleReviewsStorage.loadReviewsData();
  const cachedPlaceData = GoogleReviewsStorage.loadPlaceData();

  if (cachedData && cachedPlaceData) {
    console.log('✅ Found cached data - using fallback');
    console.log(`💾 Cached reviews: ${cachedData.reviews.length}`);
    console.log(`⭐ Cached rating: ${cachedData.stats.overview.averageRating}`);
    console.log(`📅 Cache age: ${Math.round((Date.now() - cachedData.timestamp) / (1000 * 60))} minutes`);

    console.log('\n📝 Displaying cached reviews:');
    cachedData.reviews.forEach((review, index) => {
      console.log(`${index + 1}. ${review.author} (${review.rating}⭐)`);
      console.log(`   "${review.text}"`);
      console.log('');
    });
  } else {
    console.log('❌ No cached data available');
  }
}

async function demoScenario3() {
  console.log('\n📋 SCENARIO 3: Static Fallback (No Cached Data)');
  console.log('=' .repeat(50));

  // Clear cache and simulate complete failure
  GoogleReviewsStorage.clearCache();

  console.log('❌ Simulating complete API failure...');
  console.log('🔍 Checking for cached data...');

  const cachedData = GoogleReviewsStorage.loadReviewsData();
  const fallbackData = GoogleReviewsStorage.loadFallbackReviews();

  if (!cachedData && !fallbackData) {
    console.log('❌ No cached data available');
    console.log('🔄 Using static fallback reviews...');

    const staticFallback = [
      {
        id: 'fallback-1',
        author: 'Elis R.',
        avatar: '/images/avatar-female-blonde-640w.avif',
        rating: 5,
        text: 'Que atendimento maravilhoso! Tem pessoa que realmente nasce para exalar gentileza... Minha avó foi extremamente bem atendida, da chegada a saída da clínica.',
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'fallback-2',
        author: 'Lais S.',
        avatar: '/images/avatar-female-brunette-640w.avif',
        rating: 5,
        text: 'Ótimo atendimento, excelente espaço. Profissionais muito competentes. Recomendo!',
        createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'fallback-3',
        author: 'Junia B.',
        avatar: '/images/avatar-female-brunette-960w.avif',
        rating: 5,
        text: 'Profissional extremamente competente e atencioso. Recomendo!',
        createTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    console.log('\n📝 Displaying static fallback reviews:');
    staticFallback.forEach((review, index) => {
      console.log(`${index + 1}. ${review.author} (${review.rating}⭐)`);
      console.log(`   "${review.text}"`);
      console.log('');
    });

    console.log('⚠️  Note: These are generic fallback reviews');
  }
}

async function demoScenario4() {
  console.log('\n📋 SCENARIO 4: Cache Expiration');
  console.log('=' .repeat(50));

  // Save data and simulate expiration
  GoogleReviewsStorage.saveReviewsData(sampleReviews, sampleStats, 'test-place-id');

  console.log('✅ Data saved to cache');
  console.log('⏰ Simulating cache expiration (24+ hours)...');

  // Manually expire the cache
  const expiredData = {
    reviews: sampleReviews,
    stats: sampleStats,
    placeId: 'test-place-id',
    timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
    version: '1.0'
  };

  global.window.localStorage.setItem('google_reviews_cached_data', JSON.stringify(expiredData));
  global.window.localStorage.setItem('google_reviews_last_success', expiredData.timestamp.toString());

  console.log('🔍 Testing expired cache behavior...');

  const cachedData = GoogleReviewsStorage.loadReviewsData();
  if (!cachedData) {
    console.log('✅ Cache correctly identified as expired and removed');

    // Test fallback data (has longer expiration)
    const fallbackData = GoogleReviewsStorage.loadFallbackReviews();
    if (fallbackData) {
      console.log('✅ Fallback data still available (7-day expiration)');
      console.log(`💾 Fallback reviews: ${fallbackData.reviews.length}`);
    }
  }

  console.log('\n📊 Final Cache Status:');
  console.log(`✅ Valid cache: ${GoogleReviewsStorage.hasValidCache()}`);
  console.log(`✅ Fallback data: ${GoogleReviewsStorage.hasFallbackData()}`);
}

async function showCacheStats() {
  console.log('\n📊 Cache Statistics');
  console.log('=' .repeat(50));

  const stats = GoogleReviewsStorage.getCacheStats();

  if (stats) {
    console.log(`🕒 Last success: ${stats.lastSuccess ? new Date(stats.lastSuccess).toLocaleString() : 'Never'}`);
    console.log(`✅ Has valid cache: ${stats.hasValidCache}`);
    console.log(`✅ Has fallback data: ${stats.hasFallbackData}`);

    if (stats.cacheAge) {
      const ageHours = Math.round(stats.cacheAge / (1000 * 60 * 60));
      const ageMinutes = Math.round(stats.cacheAge / (1000 * 60));
      console.log(`⏰ Cache age: ${ageHours}h ${ageMinutes % 60}m`);
    }

    console.log('\n📁 Storage Usage:');
    Object.entries(stats.storageKeys).forEach(([key, info]) => {
      console.log(`  ${key}: ${info.exists ? '✅' : '❌'} (${info.size} bytes)`);
    });
  }
}

// Main demo execution
async function runDemo() {
  console.log('🚀 Google Reviews Fallback System Demo');
  console.log('=' .repeat(60));
  console.log('This demo showcases the improved fallback system that:');
  console.log('• Saves real reviews to localStorage when API succeeds');
  console.log('• Uses cached reviews as fallback when API fails');
  console.log('• Falls back to static reviews only when no cached data exists');
  console.log('• Provides user-friendly cache status indicators');

  await initializeStorage();

  try {
    await demoScenario1();
    await demoScenario2();
    await demoScenario3();
    await demoScenario4();
    await showCacheStats();

    console.log('\n✅ Demo completed successfully!');
    console.log('\n💡 Implementation Benefits:');
    console.log('• Better user experience with real cached reviews');
    console.log('• Reduced dependency on API availability');
    console.log('• Graceful degradation with multiple fallback layers');
    console.log('• Visual indicators when using cached data');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };