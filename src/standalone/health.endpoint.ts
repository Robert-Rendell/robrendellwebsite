import { Request, Response } from "express";

export const HealthEndpoint = async (req: Request, res: Response) => {
  try {
    res.status(200).send({ status: "OK" });
  } catch (e) {
    console.log(e);
    res.status(500).send((e as Error).message);
  }
};
