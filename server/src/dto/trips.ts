import z from "zod";

export const CreateTripDto = z.object({
  vehicleId: z.string().min(5),
  driverId: z.string().min(5),
  scheduledDate: z.union([
    z.date(),
    z
      .string()
      .regex(
        /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-]\d{2}:\d{2})|([+-]\d{2}))?$/,
        {
          error: "Invalid ISO date-time format",
        }
      ),
  ]),
  mills: z
    .object({
      millId: z.string().min(5),
      plannedCollection: z.union([
        z.number(),
        z.string().regex(/^(?:\d+|\d*\.\d+)$/, {
          error: "Only numeric or decimal value allowed",
        }),
      ]),
    })
    .array()
    .nonempty(),
  estimatedDuration: z.union([
    z.number(),
    z.string().regex(/^(?:\d+|\d*\.\d+)$/, {
      error: "Only numeric or decimal value allowed",
    }),
  ]),
});

export const UpdateTripDto = z.object({
  scheduledDate: z
    .union([
      z.date(),
      z
        .string()
        .regex(
          /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|([+-]\d{2}:\d{2})|([+-]\d{2}))?$/,
          {
            error: "Invalid ISO date-time format",
          }
        ),
    ])
    .optional(),
  mills: z
    .object({
      millId: z.string().min(5),
      plannedCollection: z.union([
        z.number(),
        z.string().regex(/^(?:\d+|\d*\.\d+)$/, {
          error: "Only numeric or decimal value allowed",
        }),
      ]),
    })
    .array()
    .nonempty()
    .optional(),
  estimatedDuration: z
    .union([
      z.number(),
      z.string().regex(/^(?:\d+|\d*\.\d+)$/, {
        error: "Only numeric or decimal value allowed",
      }),
    ])
    .optional(),
});
