import { Injectable } from '@nestjs/common';
import NodeMediaServer from 'node-media-server';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

@Injectable()
export class LiveService {
  private readonly nodeMediaServer: NodeMediaServer;
  constructor() {
    const liveConfig = {
      rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8000,
        mediaroot: './media',
        webroot: './www',
        allow_origin: '*',
      },
      // https: {
      //   port: 8443,
      //   // key: './key.pem',
      //   // cert: './cert.pem',
      // },
      trans: {
        ffmpeg: '/usr/bin/ffmpeg',
        //'/Users/82104/Downloads/ffmpeg-7.0.1-essentials_build/ffmpeg-7.0.1-essentials_build/bin/ffmpeg.exe',
        tasks: [
          {
            app: 'live',
            vc: 'libx264', // x264 비디오 코덱 사용 (H.264는 인코딩 시 그래픽카드의 GPU 사용 > 사양 좋아야함.. x264는 CPU 사용)
            vcParam: [
              '-crf',
              '18', // CRF 값 (인코딩시 사용되는 품질 기준값, 18은 거의 무손실, 23은 기본값)
              '-preset',
              'slow', // 인코딩 프리셋 (한 프레임을 만드는 데에 얼마나 CPU 자원을 사용할지, 느려질수록 같은 비트레이트에서 더 나은  품질)
              '-b:v',
              '4M', // 비디오스트림 비트레이트 (초당 비트 전송률, 즉 1초당 용량, 4M는 4 Mbps)
              '-maxrate',
              '4M', // 최대 비트레이트
              '-bufsize',
              '8M', // 버퍼(임시 저장공간?) 사이즈 (8MB)
            ],
            ac: 'aac',
            acParam: ['-ab', '64k', '-ac', '1', '-ar', '44100'],
            hls: true,
            hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
            // hlsKeep: true, // to prevent hls file delete after end the stream
            // ffmpegParams: '-loglevel debug -report', // FFmpeg 로그 기록
            // dash: true,
            // dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
            // dashKeep: true, // to prevent dash file delete after end the stream
          },
          {
            app: 'live',
            mp4: true,
            mp4Flags: '[movflags=frag_keyframe+empty_moov]',
          },
        ],
      },
    };
    this.nodeMediaServer = new NodeMediaServer(liveConfig);
  }

  onModuleInit() {
    // 서버 실행하면서 미디어서버도 같이 실행

    this.nodeMediaServer.on(
      'prePublish',
      async (id: string, streamPath: string) => {
        console.log(
          '-----------------------방송시작직전--------------------------',
        );
        const session = this.nodeMediaServer.getSession(id);
        const streamKey = streamPath.split('/live/')[1];
        console.log("------streamPath: "+streamPath);

        console.log('------------------------방송시작?------------------');
        console.log('id: ' + id);
        console.log('streamKey: ' + streamKey);
      },
    );

    // 방송 종료 시
    this.nodeMediaServer.on(
      'donePublish',
      async (id: string, streamPath: string) => {
        console.log("-----------")
        const streamKey = streamPath.split('/live/')[1];
        // const live = await this.liveRepository.findOne({
        //   where: { streamKey },
        // });

        const liveDirectory = path.join(
          __dirname,
          '../../media/live',
          streamKey,
        );
        console.log(`Reading directory: ${liveDirectory}`);

        if (!fs.existsSync(liveDirectory)) {
          console.error('Live directory does not exist:', liveDirectory);
          return;
        }

        const files = fs.readdirSync(liveDirectory);
        console.log('Files in directory:', files);

        const fileName = files.find((file) => path.extname(file) === '.mp4');

        if (!fileName) {
          console.error('No .mp4 file found in directory:', liveDirectory);
          return;
        }

        const filePath = path.join(liveDirectory, fileName);
        console.log('Reading file:', filePath);

        await this.cleanupStreamFolder(streamKey);
      },
    );

    this.nodeMediaServer.run();
  }

    async cleanupStreamFolder(streamKey: string) {
      const folderPath = path.join(
        __dirname,
        '../../media/live',
        streamKey,
      );
      console.log('folderPath: ' + folderPath);
      console.log(fs.readdirSync(folderPath));
      if (fs.existsSync(folderPath)) {
        console.log("---------")
        for (const file of fs.readdirSync(folderPath)) {
          const curPath = path.join(folderPath, file);
          fs.unlinkSync(curPath);
        }
        fs.rmdirSync(folderPath);
      }
    }

  async createLive() {
    // userId로 커뮤니티아티인지 확인 + 어느 커뮤니티인지 조회
    // const communityUser = await this.communityUserRepository.findOne({
    //   where: {
    //     userId,
    //   },
    //   relations: {
    //     community: true,
    //     artists: true,
    //   },
    // });
    // const artist = await this.artistsRepository.findOne({
    //   where: {
    //     userId,
    //   },
    // });
    // if (_.isNil(artist)) {
    //   throw new NotFoundException({
    //     status: 404,
    //     message: '아티스트 회원 정보를 찾을 수 없습니다.',
    //   });
    // }
    console.log(
      '-----------------------------------------------------------------',
    );
    return '1';
  }
}
