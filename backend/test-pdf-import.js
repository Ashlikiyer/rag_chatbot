// Test parsing with PDFParse class
console.log('Testing PDFParse with buffer...\n');

const fs = require('fs');
const { PDFParse } = require('pdf-parse');

// Create a simple test - try to use it like the old pdf-parse
async function test() {
  try {
    // Method 1: Try using PDFParse class with parse method
    const parser = new PDFParse();
    console.log('Parser created');
    console.log('Parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
    
    // Check if there's a parse method
    if (typeof parser.parse === 'function') {
      console.log('✅ parse method exists!');
    }
    
  } catch (error) {
    console.log('❌ Method 1 failed:', error.message);
  }
  
  console.log('\n---\n');
  
  // Method 2: Check if PDFParse itself is callable
  try {
    console.log('Checking if PDFParse is directly callable...');
    console.log('typeof PDFParse:', typeof PDFParse);
    
    // Maybe it needs to be called as a function?
    const testBuffer = Buffer.from('test');
    // Don't actually call it, just check structure
    console.log('PDFParse.prototype:', Object.getOwnPropertyNames(PDFParse.prototype));
    
  } catch (error) {
    console.log('❌ Method 2 failed:', error.message);
  }
}

test();
