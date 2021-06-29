"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonCanonicalization = void 0;
class JsonCanonicalization {
    /**
     * Calculates the canonical serialization of a JSON document
     *
     * @param input The input
     *
     * @returns The serialization as a string
     *
     */
    static calculate(input) {
        let buffer = "";
        serialize(input);
        return buffer;
        /**
         *  Serializes in canonical format
         *
         * @param object The object to be serialized
         */
        function serialize(object) {
            if (object === null || typeof object !== "object") {
                // ///////////////////////////////////////////////
                // Primitive data type - Use ES6/JSON          //
                // ///////////////////////////////////////////////
                buffer += JSON.stringify(object);
            }
            else if (Array.isArray(object)) {
                // ///////////////////////////////////////////////
                // Array - Maintain element order              //
                // ///////////////////////////////////////////////
                buffer += "[";
                let next = false;
                object.forEach(element => {
                    if (next) {
                        buffer += ",";
                    }
                    next = true;
                    // ///////////////////////////////////////
                    // Array element - Recursive expansion //
                    // ///////////////////////////////////////
                    serialize(element);
                });
                buffer += "]";
            }
            else {
                // ///////////////////////////////////////////////
                // Object - Sort properties before serializing //
                // ///////////////////////////////////////////////
                buffer += "{";
                let next = false;
                Object.keys(object).sort()
                    .forEach(property => {
                    if (next) {
                        buffer += ",";
                    }
                    next = true;
                    // /////////////////////////////////////////////
                    // Property names are strings - Use ES6/JSON //
                    // /////////////////////////////////////////////
                    buffer += JSON.stringify(property);
                    buffer += ":";
                    // ////////////////////////////////////////
                    // Property value - Recursive expansion //
                    // ////////////////////////////////////////
                    serialize(object[property]);
                });
                buffer += "}";
            }
        }
    }
}
exports.JsonCanonicalization = JsonCanonicalization;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkNhbm9uaWNhbGl6YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9qc29uQ2Fub25pY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLG9CQUFvQjtJQUM3Qjs7Ozs7OztPQU9HO0lBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFjO1FBQ2xDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakIsT0FBTyxNQUFNLENBQUM7UUFFZDs7OztXQUlHO1FBQ0gsU0FBUyxTQUFTLENBQUMsTUFBTTtZQUNyQixJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUMvQyxrREFBa0Q7Z0JBQ2xELGlEQUFpRDtnQkFDakQsa0RBQWtEO2dCQUNsRCxNQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNwQztpQkFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzlCLGtEQUFrRDtnQkFDbEQsaURBQWlEO2dCQUNqRCxrREFBa0Q7Z0JBQ2xELE1BQU0sSUFBSSxHQUFHLENBQUM7Z0JBQ2QsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO2dCQUNqQixNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNyQixJQUFJLElBQUksRUFBRTt3QkFDTixNQUFNLElBQUksR0FBRyxDQUFDO3FCQUNqQjtvQkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUNaLDBDQUEwQztvQkFDMUMseUNBQXlDO29CQUN6QywwQ0FBMEM7b0JBQzFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLEdBQUcsQ0FBQzthQUNqQjtpQkFBTTtnQkFDSCxrREFBa0Q7Z0JBQ2xELGlEQUFpRDtnQkFDakQsa0RBQWtEO2dCQUNsRCxNQUFNLElBQUksR0FBRyxDQUFDO2dCQUNkLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztnQkFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUU7cUJBQ3pDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDQSxJQUFJLElBQUksRUFBRTt3QkFDTixNQUFNLElBQUksR0FBRyxDQUFDO3FCQUNqQjtvQkFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUNaLGdEQUFnRDtvQkFDaEQsK0NBQStDO29CQUMvQyxnREFBZ0Q7b0JBQ2hELE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUNuQyxNQUFNLElBQUksR0FBRyxDQUFDO29CQUNkLDJDQUEyQztvQkFDM0MsMENBQTBDO29CQUMxQywyQ0FBMkM7b0JBQzNDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDaEMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxJQUFJLEdBQUcsQ0FBQzthQUNqQjtRQUNMLENBQUM7SUFDTCxDQUFDO0NBQ0o7QUFyRUQsb0RBcUVDIn0=