let epcis2;

const isBrowser = new Function("try { return this===window; } catch(e) { return false; }");

// Workaround to overcome the issue of EPCIS2 library deployment
if (isBrowser()) {
    epcis2 = window.epcis2;
}
else {
    const imported = await import("epcis2.js");
    epcis2 = imported.default;
}

const { EPCISDocument, ObjectEvent } = epcis2;

export const epcisDocument = new EPCISDocument();

epcisDocument
    .setCreationDate(new Date().toISOString());

/*
"@context": "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "isA": "ObjectEvent",
    "epcList": [
        "urn:jaif:id:obj:37SUN321456789A111222333AB+123456789012"
    ],
    "action": "OBSERVE",
    "eventTime": "2021-04-01T12:35:15.100Z",
    "eventTimeZoneOffset": "+01:00",
    "readPoint": { "id": "urn:epc:id:sgln:9524678.90000.WarehouseD2" },
    "bizStep": "shipping",
    "disposition": "in_progress"
*/

const event1 = new ObjectEvent();

// Part to be delivered by the supplier
const partNumber = "urn:jaif:id:obj:37SUN321456789A111222333AB+123456789012";
// Warehouse of the supplier reading point D2
const supplierWarehouseD2 = "urn:epc:id:sgln:9524678.90000.WarehouseD2";
// The location of the OEM's factory
const oemFactory = "urn:epc:id:sgln:9524987.20000.0";

event1
.setAction("ADD")
.setEventTime(new Date().toISOString())
.setEventTimeZoneOffset(2)
.setReadPoint(supplierWarehouseD2)
.setBizStep("shipping")
.setDisposition("in_progress")
.addEPC(partNumber);

epcisDocument.addEvent(event1);

/*
{
    "@context": "https://ref.gs1.org/standards/epcis/epcis-context.jsonld",
    "isA": "ObjectEvent",
    "epcList": [
        "urn:jaif:id:obj:37SUN321456789A111222333AB+123456789012"
    ],
    "action": "OBSERVE",
    "eventTime": "2021-04-02T16:15:10.200Z",
    "eventTimeZoneOffset": "+01:00",
    "bizLocation": { "id": "urn:epc:id:sgln:9524987.20000.0" },
    "bizStep": "receiving",
    "disposition": "in_progress"
}
*/

const event2 = new ObjectEvent();

event2
.setAction("ADD")
.setEventTime(new Date().toISOString())
.setEventTimeZoneOffset(2)
.setBizLocation(oemFactory)
.setBizStep("receiving")
.setDisposition("in_progress")
.addEPC(partNumber);

epcisDocument.addEvent(event2);
