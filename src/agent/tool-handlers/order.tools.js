export const prepareOrderSubmissionTool = {
    name: "prepare_order_submission",
    description: "Prepare order submission and switch the UI to the orders tab",
    parameters: {
        type: "object",
        properties: {},
    },
    async execute() {
        return {
            ok: true,
            nextStep: "Review cart and submit order from the UI",
        };
    },
};

export const openBillTool = {
    name: "open_bill",
    description: "Open the bill tab",
    parameters: {
        type: "object",
        properties: {},
    },
    async execute() {
        return {
            ok: true,
            tab: "bill",
        };
    },
};