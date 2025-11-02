import z from "zod";

export const CreateDriverDto = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  licenseNumber: z.string().min(5, "License number must be at least 5 characters long"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters long"),
  status: z.enum(["available", "on_trip", "inactive"]).optional(),
});

export const UpdateDriverDto = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").optional(),
  licenseNumber: z.string().min(5, "License number must be at least 5 characters long").optional(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters long").optional(),
  status: z.enum(["available", "on_trip", "inactive"]).optional(),
});