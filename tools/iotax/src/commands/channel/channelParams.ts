import ICommandParam from "../../ICommandParam";

export const channelParam: ICommandParam =
{
    name: "channelID",
    options: {
        type: "string",
        description: "ID of the Channel ('address:announceMsgID') from which to fetch the message",
        required: true
    }
};
