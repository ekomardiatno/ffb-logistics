import Vehicle from "./vehicle";
import Driver from "./driver";
import Mill from "./mill";
import Trip from "./trip";
import Collection from "./collection";

// Associations
Vehicle.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });
Driver.hasMany(Vehicle, { foreignKey: "driverId", as: "vehicles" });

Trip.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
Trip.belongsTo(Driver, { foreignKey: "driverId", as: "driver" });

Collection.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });
Collection.belongsTo(Mill, { foreignKey: "millId", as: "mill" });

Trip.hasMany(Collection, { foreignKey: "tripId", as: "collections" });

export { Vehicle, Driver, Mill, Trip, Collection };
