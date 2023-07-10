import { useLinkPreview } from "../../composables/useLinkPreview";

export default defineEventHandler(async (event) => {
  console.log("event", event);

  const body = getQuery(event);

  const preview = await useLinkPreview(<string>body.url);

  return { preview };
});