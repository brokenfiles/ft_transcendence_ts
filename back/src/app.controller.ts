import {Controller, Get, HttpStatus, Res} from '@nestjs/common';
import { Response } from "express";
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getIndex(@Res() res: Response) {
    res.status(HttpStatus.OK).json({
      message: `C'est good`
    });
  }
}

