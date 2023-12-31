import { useLinkPreview } from "../../composables/useLinkPreview";

export default defineEventHandler(async (event) => {

  const body = getQuery(event);

  const preview = await useLinkPreview(<string>body.url);

  return { preview };
});