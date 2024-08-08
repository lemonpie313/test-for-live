import {
  Controller,
  Post,
  UseGuards,
  Request,
  HttpStatus,
  Body,
  Query,
  Param,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LiveService } from './live.service';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  /**
   * 라이브 스트리밍 제목 등록 + 키 받아오기
   *
   * @returns
   */
  // @ApiBearerAuth()
  // @Roles(UserRole.User)
  // @UseGuards(RolesGuard)
  @Post('/')
  async createLive(@Request() req) {
    const live = await this.liveService.createLive();
    return {
      status: HttpStatus.CREATED,
      message: '완료',
      data: live,
    };
  }
}
