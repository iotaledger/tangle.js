// es-lint-disable unicorn/no-array-for-each
export class JsonCanonicalization {
    /**
     * Calculates the canonical serialization of a JSON document
     *
     * @param input The input
     * @returns The serialization as a string
     */
    public static calculate(input: unknown): string {
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
            } else if (Array.isArray(object)) {
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
            } else {
                // ///////////////////////////////////////////////
                // Object - Sort properties before serializing //
                // ///////////////////////////////////////////////
                buffer += "{";
                let next = false;
                Object.keys(object as unknown).sort()
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
