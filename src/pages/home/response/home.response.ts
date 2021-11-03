import ImageUrl from '../models/image-s3-url';

interface HomeResponse {
  travelImages: ImageUrl[];
}

export { HomeResponse as default };
