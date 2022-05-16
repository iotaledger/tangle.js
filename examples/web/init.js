import main_anchors from "../anchors-example.js";
import main_signatures from "../ld-signatures-example.js";
import main_ld_proofs from "../iota-ld-proofs-example.js";
// import anchorEPCISDocument from "../epcis/anchor-epcis-events.js";

// import { epcisDocument } from "../epcis/events.js";


window.onload = async () => {
  console.log("On load");

  // handle test on click event
  document.querySelector("#test-anchors-example").addEventListener("click", async () => main_anchors());
  document.querySelector("#test-ld-signatures-example").addEventListener("click", async () => main_signatures());
  document.querySelector("#test-iota-proofs-example").addEventListener("click", async () => main_ld_proofs());
  // document.querySelector("#test-epcis").addEventListener("click", async () => anchorEPCISDocument(epcisDocument));
};
