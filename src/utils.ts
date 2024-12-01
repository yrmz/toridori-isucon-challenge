import { Post } from "@prisma/client";

export function imageUrl(post: Post): string {
  let ext = "";

  switch (post.mime) {
    case "image/jpeg":
      ext = ".jpg";
      break;
    case "image/png":
      ext = ".png";
      break;
    case "image/gif":
      ext = ".gif";
      break;
  }

  return `/image/${post.id.toString()}${ext}`;
}
