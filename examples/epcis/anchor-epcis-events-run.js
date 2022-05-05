import anchorEPCISDocument from "./anchor-epcis-events.js";
import { epcisDocument } from "./events.js";

async function main() {
  await anchorEPCISDocument(epcisDocument);
}

main()
  .then(() => {})
  .catch((err) => {
    console.log(err);
  });
