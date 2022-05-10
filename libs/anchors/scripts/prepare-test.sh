#!/bin/sh

cp src/helpers/initializationHelper.ts src/helpers/initializationHelper-web.ts
rm src/helpers/initializationHelper.ts
mv src/helpers/initializationHelper-jest.ts src/helpers/initializationHelper.ts