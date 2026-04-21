import Joi from "joi";

const menuItemSchema = Joi.object({
    itemID: Joi.number().integer().allow(null),
    id: Joi.number().integer().allow(null),
    itemName: Joi.string().allow("", null),
    name: Joi.string().allow("", null),
    descriptions: Joi.string().allow("", null),
    description: Joi.string().allow("", null),
    type_of_food: Joi.string().allow("", null),
    category: Joi.string().allow("", null),
    section: Joi.string().allow("", null),
    ingredients: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string().allow("", null),
        Joi.allow(null)
    ),
}).unknown(true);

const cartItemSchema = Joi.object({
    quantity: Joi.number().integer().min(1).required(),
    note: Joi.string().allow("", null),
    dishId: Joi.number().integer().allow(null),
    itemID: Joi.number().integer().allow(null),
    menuItem: menuItemSchema.allow(null),
}).unknown(true);

export const agentMessageSchema = Joi.object({
    userId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    text: Joi.string().trim().min(1).max(2000).required(),
    context: Joi.object({
        scope: Joi.string().valid("user_ordering").default("user_ordering"),
        surface: Joi.string().valid("staff_page").default("staff_page"),
        currentTab: Joi.string().valid("menu", "orders", "bill").allow(null),
        route: Joi.string().allow("", null),
        selectedDishId: Joi.number().integer().allow(null),
        cartItemCount: Joi.number().integer().min(0).allow(null),
        menuItems: Joi.array().items(menuItemSchema).default([]),
        cart: Joi.array().items(cartItemSchema).default([]),
    })
        .default({ scope: "user_ordering", surface: "staff_page", menuItems: [], cart: [] })
        .unknown(false),
});

export const voiceTranscribeSchema = Joi.object({
    audioBase64: Joi.string().trim().required(),
    mimeType: Joi.string().trim().default("audio/webm"),
});

export function validateAgentMessage(payload) {
    return agentMessageSchema.validate(payload, {
        abortEarly: false,
        stripUnknown: true,
    });
}

export function validateVoiceTranscribe(payload) {
    return voiceTranscribeSchema.validate(payload, {
        abortEarly: false,
        stripUnknown: true,
    });
}