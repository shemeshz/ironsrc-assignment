import {Component} from '@angular/core';
import {VgAPI} from 'videogular2/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {
  trigger,
  style,
  animate,
  transition,
} from '@angular/animations';

declare var $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(100%)'}),
        animate('300ms ease-in', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({transform: 'translateY(100%)'}))
      ])
    ])
  ]
})


export class AppComponent {
  deviceInfo = null;
  api: VgAPI;
  private showTapToHit: boolean;
  private showDownload: boolean;
  private firstPause: boolean;
  private downLoadUrl: string;

  constructor(private deviceService: DeviceDetectorService) {
    this.getDeviceInfo();
    this.showTapToHit = false;
    this.showDownload = false;
  }


  getDeviceInfo() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    // set download url
    if (this.deviceInfo.os === 'iOS') {
      this.downLoadUrl = 'https://itunes.apple.com/us/app/mini-golf-king-multiplayer/id1262262200?mt=8';
    } else {
      this.downLoadUrl = 'https://play.google.com/store/apps/details?id=com.pnixgames.minigolfking&hl=en';
    }
    // set window size to desktop
    if (isDesktopDevice) {
      $('body').addClass('is-desktop');
    }
  }

  resumeVid() {
    this.showTapToHit = false;
    this.api.play();
  }

  onPlayerReady(api: VgAPI) {
    this.showTapToHit = false;
    this.showDownload = false;
    this.api = api;

    // when data is loaded
    this.api.getDefaultMedia().subscriptions.loadedData.subscribe(
      () => {
        this.api.play();
        this.trackingPixel('http://www.mocky.io/v2/5be098b232000072006496f5');
      }
    );

    // listen to current time of video
    this.api.getDefaultMedia().subscriptions.timeUpdate.subscribe(
      () => {
        const currentTime = Math.round(this.api.currentTime);
        if (currentTime === 3 && !this.firstPause) {
          this.firstPause = true;
          this.showTapToHit = true;
          this.api.pause();
          setTimeout(() => {
            this.showTapToHit = false;
            this.showDownload = true;
            this.api.currentTime = 13;
            this.api.play();
          }, 10000);
        }

        if (currentTime === 13) {
          this.showTapToHit = false;
          this.showDownload = true;
        }
      }
    );

    // when video is ended
    this.api.getDefaultMedia().subscriptions.ended.subscribe(
      () => {
        this.trackingPixel('http://www.mocky.io/v2/5be098d03200004d006496f6');
      }
    );

  }

  trackingPixel(url: string) {
    if (url) {
      fetch(url)
        .then(response => console.log(response));
    }
  }


}



