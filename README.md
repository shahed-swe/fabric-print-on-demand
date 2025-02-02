# Print-on-Demand T-Shirt Designer

A Next.js application for designing custom t-shirts with front and back views.

## Features

- Interactive t-shirt designer with front and back views
- Multiple t-shirt styles (Regular, Women's, Hoodie, Long Sleeve, Tank)
- Color customization
- Size selection
- Image upload and placement
- PDF export of designs
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 14.x or higher
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `public/images` directory and add the following t-shirt template images:
   - crew_front.png
   - crew_back.png
   - mens_hoodie_front.png
   - mens_hoodie_back.png
   - mens_longsleeve_front.png
   - mens_longsleeve_back.png
   - mens_tank_front.png
   - mens_tank_back.png
   - womens_crew_front.png
   - womens_crew_back.png

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build

```bash
npm run build
# or
yarn build
```

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Fabric.js
- html2canvas
- jsPDF
