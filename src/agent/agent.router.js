import { Router } from "express";
import {
    handleAgentMessage,
    transcribeVoiceChunk,
} from "./agent.controller.js";

const router = Router();

router.post("/message", handleAgentMessage);
router.post("/voice/transcribe", transcribeVoiceChunk);

export default router;