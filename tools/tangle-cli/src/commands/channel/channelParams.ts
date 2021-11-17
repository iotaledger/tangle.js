import ICommandParam from "../../ICommandParam";

export const channelParam: ICommandParam = {
    name: "channelID",
    options: {
        type: "string",
        description: "ID of the Channel ('address:announceMsgID') from which to fetch the message",
        required: true
    }
};

export const encryptedParam: ICommandParam = {
    name: "encrypted",
    options: {
        type: "boolean",
        description: "Whether the channel must be encrypted or not"
    }
};

export const privateParam: ICommandParam = {
    name: "private",
    options: {
        type: "boolean",
        description: "Whether the channel is private or not"
    }
};
