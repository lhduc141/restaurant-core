import axios from "axios";

export async function transcribeAudioChunk({ audioBase64, mimeType }) {
    const baseURL = process.env.VOICE_WORKER_URL || "http://localhost:8008";

    const response = await axios.post(`${baseURL}/transcribe`, {
        audio_base64: audioBase64,
        mime_type: mimeType,
        enhance: true,
    }, {
        timeout: 30000,
    });

    return response.data?.text || "";
}