import z from "zod";

export const CreateMillDto = z.object({
  avgDailyProduction: z.number().min(1),
  contactPerson: z.string().min(3),
  phoneNumber: z.string().min(10),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  name: z.string().min(3),
});

export const UpdateMillDto = z.object({
  avgDailyProduction: z.number().min(1).optional(),
  contactPerson: z.string().min(3).optional(),
  phoneNumber: z.string().min(10).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  name: z.string().min(3).optional(),
});
