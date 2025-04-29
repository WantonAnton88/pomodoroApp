import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Haptics } from '@capacitor/haptics'; // Import Haptics
import { LocalNotifications } from '@capacitor/local-notifications'; // Import Local Notifications

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  timer: number = 25 * 60; // 25 minutes in seconds
  isRunning: boolean = false;
  isWorkPhase: boolean = true; // true for work phase, false for break phase
  timerSubscription: Subscription | null = null;
  currentTime: string = ''; // To store the real-time clock

  constructor() {}

  ngOnInit() {
    // Initialize the real-time clock
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);

    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString(); // Format the time as HH:MM:SS
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timerSubscription = interval(1000).subscribe(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          this.handleTimerEnd();
        }
      });
    }
  }

  pauseTimer() {
    if (this.isRunning) {
      this.isRunning = false;
      this.timerSubscription?.unsubscribe();
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timer = this.isWorkPhase ? 10 : 5; // Set work phase to 10 seconds and break phase to 5 seconds for testing
  }

  handleTimerEnd() {
    this.pauseTimer();
    this.triggerNotification();
    this.isWorkPhase = !this.isWorkPhase; // Switch phase
    this.timer = this.isWorkPhase ? 10 : 5; // Set work phase to 10 seconds and break phase to 5 seconds for testing
  }

  async triggerNotification() {
    const message = this.isWorkPhase
      ? 'Work session ended! Time for a break.'
      : 'Break ended! Time to get back to work.';
  
    // Use Local Notifications
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Pomodoro Timer',
          body: message,
          id: new Date().getTime(), // Unique ID for the notification
          schedule: { at: new Date(new Date().getTime() + 1000) }, // Schedule immediately
        },
      ],
    });
  
    // Use Capacitor Haptics for longer vibration (5 seconds)
    await Haptics.vibrate({ duration: 5000 }); // Vibrate for 5 seconds
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timer / 60);
    const seconds = this.timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}