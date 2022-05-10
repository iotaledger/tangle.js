export class JsonCanonicalization {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkNhbm9uaWNhbGl6YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9qc29uQ2Fub25pY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sb0JBQW9CO0lBQzdCOzs7Ozs7O09BT0c7SUFDSSxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQWM7UUFDbEMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVqQixPQUFPLE1BQU0sQ0FBQztRQUVkOzs7O1dBSUc7UUFDSCxTQUFTLFNBQVMsQ0FBQyxNQUFNO1lBQ3JCLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQy9DLGtEQUFrRDtnQkFDbEQsaURBQWlEO2dCQUNqRCxrREFBa0Q7Z0JBQ2xELE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3BDO2lCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDOUIsa0RBQWtEO2dCQUNsRCxpREFBaUQ7Z0JBQ2pELGtEQUFrRDtnQkFDbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztnQkFDZCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3JCLElBQUksSUFBSSxFQUFFO3dCQUNOLE1BQU0sSUFBSSxHQUFHLENBQUM7cUJBQ2pCO29CQUNELElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ1osMENBQTBDO29CQUMxQyx5Q0FBeUM7b0JBQ3pDLDBDQUEwQztvQkFDMUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QixDQUFDLENBQUMsQ0FBQztnQkFDSCxNQUFNLElBQUksR0FBRyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNILGtEQUFrRDtnQkFDbEQsaURBQWlEO2dCQUNqRCxrREFBa0Q7Z0JBQ2xELE1BQU0sSUFBSSxHQUFHLENBQUM7Z0JBQ2QsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO2dCQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRTtxQkFDekMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNBLElBQUksSUFBSSxFQUFFO3dCQUNOLE1BQU0sSUFBSSxHQUFHLENBQUM7cUJBQ2pCO29CQUNELElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ1osZ0RBQWdEO29CQUNoRCwrQ0FBK0M7b0JBQy9DLGdEQUFnRDtvQkFDaEQsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ25DLE1BQU0sSUFBSSxHQUFHLENBQUM7b0JBQ2QsMkNBQTJDO29CQUMzQywwQ0FBMEM7b0JBQzFDLDJDQUEyQztvQkFDM0MsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxNQUFNLElBQUksR0FBRyxDQUFDO2FBQ2pCO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9