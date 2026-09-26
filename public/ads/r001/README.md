# R001 production cuts

Host the six H.264 files here as-is. Same filenames the house splash and Marks strip already request:

| File | Frame | Length |
| --- | --- | --- |
| `r001-hero-duality-reels-1080x1920-15s.mp4` | 1080×1920 | 15s |
| `r001-six-marks-reels-1080x1920-18s.mp4` | 1080×1920 | 18s |
| `r001-feed-4x5-1080x1350-15s.mp4` | 1080×1350 | 15s |
| `r001-square-1080x1080-12s.mp4` | 1080×1080 | 12s |
| `r001-horns-lane-reels-1080x1920-13s.mp4` | 1080×1920 | 13s |
| `r001-halos-lane-reels-1080x1920-13s.mp4` | 1080×1920 | 13s |

`/uploads` and task attachments were empty, and `public/` had no prior mp4s. Files in this folder are house-still stand-ins encoded H.264 so the splash and links have a real source. **Founder: overwrite these with the production binaries. Keep the filenames and H.264.** Do not re-wrap the live cuts.

To serve from Vercel Blob or another public CDN instead, set `NEXT_PUBLIC_R001_ADS_BASE` to the folder URL (no trailing slash required). The six filenames must sit in that folder.
