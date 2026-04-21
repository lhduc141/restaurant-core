// src/agent/dto/agent-message.dto.js
import Joi from "joi";

export const agentMessageSchema = Joi.object({
    userId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    text: Joi.string().trim().min(1).max(2000).required(),
    context: Joi.object({
        scope: Joi.string().valid("user_ordering").default("user_ordering"),
        route: Joi.string().allow("", null),
        selectedDishId: Joi.number().integer().allow(null),
        cartItemCount: Joi.number().integer().min(0).allow(null),
    }).default({ scope: "user_ordering" }),
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