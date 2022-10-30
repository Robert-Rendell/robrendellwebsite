import { ImageUrl } from '../../../models/image-s3-url';

export interface HomePageResponse {
  travelImages: ImageUrl[];
  originals: Record<ImageUrl, ImageUrl>[];
}
