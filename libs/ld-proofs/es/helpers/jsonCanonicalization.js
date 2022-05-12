// es-lint-disable unicorn/no-array-for-each
export class JsonCanonicalization {
    /**
     * Calculates the canonical serialization of a JSON document
     *
     * @param input The input
     * @returns The serialization as a string
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbkNhbm9uaWNhbGl6YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaGVscGVycy9qc29uQ2Fub25pY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw0Q0FBNEM7QUFDNUMsTUFBTSxPQUFPLG9CQUFvQjtJQUM3Qjs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBYztRQUNsQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpCLE9BQU8sTUFBTSxDQUFDO1FBRWQ7Ozs7V0FJRztRQUNILFNBQVMsU0FBUyxDQUFDLE1BQU07WUFDckIsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtnQkFDL0Msa0RBQWtEO2dCQUNsRCxpREFBaUQ7Z0JBQ2pELGtEQUFrRDtnQkFDbEQsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDcEM7aUJBQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM5QixrREFBa0Q7Z0JBQ2xELGlEQUFpRDtnQkFDakQsa0RBQWtEO2dCQUNsRCxNQUFNLElBQUksR0FBRyxDQUFDO2dCQUNkLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztnQkFDakIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDckIsSUFBSSxJQUFJLEVBQUU7d0JBQ04sTUFBTSxJQUFJLEdBQUcsQ0FBQztxQkFDakI7b0JBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDWiwwQ0FBMEM7b0JBQzFDLHlDQUF5QztvQkFDekMsMENBQTBDO29CQUMxQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZCLENBQUMsQ0FBQyxDQUFDO2dCQUNILE1BQU0sSUFBSSxHQUFHLENBQUM7YUFDakI7aUJBQU07Z0JBQ0gsa0RBQWtEO2dCQUNsRCxpREFBaUQ7Z0JBQ2pELGtEQUFrRDtnQkFDbEQsTUFBTSxJQUFJLEdBQUcsQ0FBQztnQkFDZCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7Z0JBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBaUIsQ0FBQyxDQUFDLElBQUksRUFBRTtxQkFDcEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNBLElBQUksSUFBSSxFQUFFO3dCQUNOLE1BQU0sSUFBSSxHQUFHLENBQUM7cUJBQ2pCO29CQUNELElBQUksR0FBRyxJQUFJLENBQUM7b0JBQ1osZ0RBQWdEO29CQUNoRCwrQ0FBK0M7b0JBQy9DLGdEQUFnRDtvQkFDaEQsTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ25DLE1BQU0sSUFBSSxHQUFHLENBQUM7b0JBQ2QsMkNBQTJDO29CQUMzQywwQ0FBMEM7b0JBQzFDLDJDQUEyQztvQkFDM0MsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxNQUFNLElBQUksR0FBRyxDQUFDO2FBQ2pCO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9