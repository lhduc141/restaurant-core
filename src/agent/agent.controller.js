import { runAgentTurn } from "./agent.service.js";
import { transcribeAudioChunk } from "../services/voiceClient.js";
import {
    validateAgentMessage,
    validateVoiceTranscribe,
} from "./dto/agent-message.dto.js";

export async function handleAgentMessage(req, res) {
    try {
        const { error, value } = validateAgentMessage(req.body);

        if (error) {
            return res.status(400).json({
                error: "Invalid request payload",
                details: error.details.map((d) => d.message),
            });
        }

        const { userId, text, context } = value;
        const result = await runAgentTurn({
            userId,
            inputText: text,
            context,
        });

        return res.json(result);
    } catch (error) {
        console.error(`[${req.requestId}] [agent.message]`, error);
        return res.status(500).json({
            error: "Failed to process agent message",
        });
    }
}

export async function transcribeVoiceChunk(req, res) {
    try {
        const { error, value } = validateVoiceTranscribe(req.body);

        if (error) {
            return res.status(400).json({
                error: "Invalid request payload",
                details: error.details.map((d) => d.message),
            });
        }

        const transcript = await transcribeAudioChunk({
            audioBase64: value.audioBase64,
            mimeType: value.mimeType,
        });

        return res.json({ transcript });
    } catch (error) {
        console.error(`[${req.requestId}] [agent.voice.transcribe]`, error);
        return res.status(500).json({
            error: "Failed to transcribe audio",
        });
    }
}