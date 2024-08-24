import { Express, Request, Response } from 'express';
import { PostgresDB } from './postgres-db';

export function mountRoutes(app: Express) {
  app.get('/api/restaurants', async (req: Request, res: Response) => {
    const { prisma } = PostgresDB.getInstance();

    try {
      const restaurantsData = await prisma.$queryRaw<{ [key: string]: any }[]>`
        SELECT
          id,
          name,
          description,
          ST_X(location::geometry) AS longitude,
          ST_Y(location::geometry) AS latitude
          FROM public.restaurants
      `;

      const restaurants = restaurantsData.map(
        (restaurant: { [key: string]: any }) => {
          const { longitude, latitude, ...restData } = restaurant;
          return {
            ...restData,
            location: {
              longitude,
              latitude,
            },
          };
        }
      );

      res.status(200).json({
        status: 'success',
        data: {
          restaurants,
          count: restaurants.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: (error as Error).message,
        details: error,
      });
    }
  });

  app.get('/api/restaurants/within', async (req: Request, res: Response) => {
    const { prisma } = PostgresDB.getInstance();
    let statusCode = 500;

    try {
      const { latitude, longitude, radius } = req.query;

      // Validate query parameters
      if (!latitude || !longitude || !radius) {
        statusCode = 400;
        throw new Error(
          'Missing required query parameters: latitude, longitude, and radius.'
        );
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const rad = parseFloat(radius as string);

      // Validate that parsed numbers are valid
      if (isNaN(lat) || isNaN(lon) || isNaN(rad)) {
        statusCode = 400;
        throw new Error('Invalid query parameter values.');
      }

      const restaurantsData = await prisma.$queryRaw<
        {
          id: number;
          name: string;
          description: string;
          longitude: number;
          latitude: number;
        }[]
      >`
        SELECT
          id,
          name,
          description,
          ST_X(location::geometry) AS longitude,
          ST_Y(location::geometry) AS latitude
        FROM public.restaurants
        WHERE ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326),
          ${rad}
        )
      `;

      // Map to the required format
      const restaurants = restaurantsData.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        location: {
          longitude: restaurant.longitude,
          latitude: restaurant.latitude,
        },
      }));

      res.status(200).json({
        status: 'success',
        data: {
          restaurants,
          count: restaurants.length,
        },
      });
    } catch (error) {
      res.status(statusCode).json({
        status: 'error',
        message: (error as Error).message,
        details: error,
      });
    }
  });

  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
    });
  });
}
