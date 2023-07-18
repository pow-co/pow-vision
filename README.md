# POW Vision - A BoostPOW 3D Renderer

This project is a 3D renderer that showcases tags on pow.co with Boost Proof-of-Work (BoostPOW) attached, as described by Daniel Krawisz. The sizes of the objects are based on the difficulty of the BoostPOW, and the text is inspired by the "[Look up At the Sky](https://vimeo.com/689339296)" video.

## Technologies Used

The BoostPOW 3D Renderer project utilizes the following technologies:

- [Nuxt.js](https://nuxtjs.org): A Vue.js framework for building server-side rendered and static websites.
- [TresJS](https://tres.js.org): A 3D rendering engine based on WebGL and Three.js, providing powerful tools for creating interactive 3D experiences.
- [BoostPOW API](https://pow.co/api): The official pow.co API which is how the rank/difficulties of the tags are retrieved.

## Project Setup

To get started with the BoostPOW 3D Renderer, follow the steps below:

1. Install the project dependencies using your preferred package manager:

   ```bash
   # npm
   npm install

   # pnpm
   pnpm install

   # yarn
   yarn install
   ```

2. Start the development server on `http://localhost:3000`:

   ```bash
   # npm
   npm run dev

   # pnpm
   pnpm run dev

   # yarn
   yarn dev
   ```

## Building for Production

To build the BoostPOW 3D Renderer for production, use the following command:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build
```

To preview the production build locally, use the following command:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview
```

For detailed deployment instructions, please refer to the deployment documentation provided by Nuxt.js.

## Additional Resources

To learn more about Nuxt.js, TresJS, and the BoostPOW API, consult their official documentation:

- [Nuxt.js Documentation](https://nuxtjs.org/docs)
- [TresJS Documentation](https://tres.js.org/docs)
- [BoostPOW API Documentation](https://pow.co/api)