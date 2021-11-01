import { Request, Response } from 'express';

export const homepage = async (req: Request, res: Response) => {
  try {
    res.status(200).send(['hello', 'world']);
  } catch (e) {
    res.status(500).send((e as any).message);
  }
}
