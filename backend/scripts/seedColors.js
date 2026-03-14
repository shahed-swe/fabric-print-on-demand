const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Color = require('../src/models/Color');

const existingColors = [
  {
    name: 'light-gray',
    hexCode: '#F6F6F6',
    displayName: 'Light Gray',
    description: 'Light gray color',
    sortOrder: 0
  },
  {
    name: 'black',
    hexCode: '#000000',
    displayName: 'Black',
    description: 'Pure black color',
    sortOrder: 1
  },
  {
    name: 'dark-blue',
    hexCode: '#0C0CAE',
    displayName: 'Dark Blue',
    description: 'Dark blue color',
    sortOrder: 2
  },
  {
    name: 'dark-gray',
    hexCode: '#2A2929',
    displayName: 'Dark Gray',
    description: 'Dark gray color',
    sortOrder: 3
  },
  {
    name: 'gray',
    hexCode: '#808080',
    displayName: 'Gray',
    description: 'Medium gray color',
    sortOrder: 4
  },
  {
    name: 'olive',
    hexCode: '#919a54',
    displayName: 'Olive',
    description: 'Olive green color',
    sortOrder: 5
  },
  {
    name: 'dark-red',
    hexCode: '#7F3232',
    displayName: 'Dark Red',
    description: 'Dark red color',
    sortOrder: 6
  },
  {
    name: 'dark-teal',
    hexCode: '#276457',
    displayName: 'Dark Teal',
    description: 'Dark teal color',
    sortOrder: 7
  },
  {
    name: 'cyan',
    hexCode: '#0DD6C5',
    displayName: 'Cyan',
    description: 'Cyan/turquoise color',
    sortOrder: 8
  }
];

async function seedColors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing colors
    const deleteResult = await Color.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing colors`);

    // Insert new colors
    const result = await Color.insertMany(
      existingColors.map(color => ({
        ...color,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );

    console.log(`✅ Successfully seeded ${result.length} colors to database`);
    console.log('Colors:');
    result.forEach(color => {
      console.log(`  - ${color.displayName} (${color.hexCode}) - ${color.name}`);
    });

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('❌ Error seeding colors:', error.message);
    process.exit(1);
  }
}

seedColors();
