import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "klipin",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type Events = {
  "klipin/video.submitted": {
    data: {
      jobId: string;
      userId: string;
      videoId: string;
      customPrompt: string;
    };
  };
};
