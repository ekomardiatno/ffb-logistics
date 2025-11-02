import z from "zod";

export const CreateVehicleDto = z.object({
  plateNumber: z.string().min(5),
  type: z.string().min(3),
  capacity: z.number().min(1),
  driverId: z.string().min(5)
});

export const UpdateVehicleDto = z.object({
  plateNumber: z.string().min(5).optional(),
  type: z.string().min(3).optional(),
  capacity: z.number().min(1).optional(),
  driverId: z.string().min(5).optional()
});
