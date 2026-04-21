import { emitToUser } from "../../realtime/socket.js";

export const setTabTool = {
    name: "set_tab",
    description: "Switch the current UI tab",
    parameters: {
        type: "object",
        properties: {
            tab: {
                type: "string",
                enum: ["menu", "orders", "bill"],
            },
        },
        required: ["tab"],
    },
    async execute({ userId, args }) {
        emitToUser(userId, "ui_action", {
            type: "SET_TAB",
            payload: { tab: args.tab },
        });
        return { ok: true, tab: args.tab };
    },
};

export const filterMenuSectionTool = {
    name: "filter_menu_section",
    description: "Filter menu items by section/category/type of food",
    parameters: {
        type: "object",
        properties: {
            section: { type: "string" },
        },
        required: ["section"],
    },
    async execute({ userId, args }) {
        emitToUser(userId, "ui_action", {
            type: "FILTER_MENU_SECTION",
            payload: { section: args.section },
        });
        return { ok: true, section: args.section };
    },
};

export const highlightDishTool = {
    name: "highlight_dish",
    description: "Highlight a dish on the screen",
    parameters: {
        type: "object",
        properties: {
            dishId: { type: "number" },
        },
        required: ["dishId"],
    },
    async execute({ userId, args }) {
        emitToUser(userId, "ui_action", {
            type: "HIGHLIGHT_DISH",
            payload: { dishId: args.dishId },
        });
        return { ok: true, dishId: args.dishId };
    },
};

export const openDishDetailTool = {
    name: "open_dish_detail",
    description: "Open a specific dish detail panel in the UI",
    parameters: {
        type: "object",
        properties: {
            dishId: { type: "number" },
        },
        required: ["dishId"],
    },
    async execute({ userId, args }) {
        emitToUser(userId, "ui_action", {
            type: "OPEN_DISH_DETAIL",
            payload: { dishId: args.dishId },
        });
        return { ok: true, dishId: args.dishId };
    },
};