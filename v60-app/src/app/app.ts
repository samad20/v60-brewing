import { Component, signal, computed, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

type BrewType = 'hot' | 'cold';
type ComfortLevel = 'classic' | 'fruit';

interface PourStep {
  label: string;
  amount: number;
  cumulative: number;
  description: string;
}

@Component({
  selector: 'app-root',
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  brewType = signal<BrewType>('hot');
  comfortLevel = signal<ComfortLevel>('classic');
  coffeeAmount = signal(15);
  waterAmount = signal(225);
  recipeCalculated = signal(false);

  // Timer state
  timerSeconds = signal(30);
  timerRunning = signal(false);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Computed recipe values
  hotSteps = signal<PourStep[]>([]);
  coldSteps = signal<PourStep[]>([]);
  iceAmount = signal(0);
  coldWaterAmount = signal(0);

  temperature = computed(() => {
    if (this.comfortLevel() === 'classic') {
      return { min: 88, max: 92, note: 'Classic balanced extraction' };
    }
    return { min: 92, max: 96, note: 'Enhanced fruit notes with higher temperature' };
  });

  onCoffeeChange(value: string): void {
    const coffee = parseFloat(value);
    if (!isNaN(coffee) && coffee > 0) {
      this.coffeeAmount.set(coffee);
      this.waterAmount.set(Math.round(coffee * 15));
    }
  }

  onWaterChange(value: string): void {
    const water = parseFloat(value);
    if (!isNaN(water) && water > 0) {
      this.waterAmount.set(water);
      this.coffeeAmount.set(Math.round(water / 15));
    }
  }

  calculateRecipe(): void {
    const coffee = this.coffeeAmount();
    const water = this.waterAmount();

    if (coffee <= 0 || water <= 0) return;

    // Hot recipe
    const firstPour = coffee * 2;
    const remainingWater = water - firstPour;
    const pourAmount = Math.round(remainingWater / 3);

    let cumulative = firstPour;
    const hotSteps: PourStep[] = [
      {
        label: 'Bloom',
        amount: firstPour,
        cumulative: firstPour,
        description: `Pour ${firstPour}g of water for the bloom. Wait 30 seconds.`,
      },
    ];

    for (let i = 1; i <= 3; i++) {
      const amt = i === 3 ? water - cumulative : pourAmount;
      cumulative += amt;
      hotSteps.push({
        label: `Pour ${i}`,
        amount: amt,
        cumulative,
        description: `Pour ${amt}g of water in a slow circular motion.`,
      });
    }
    this.hotSteps.set(hotSteps);

    // Cold recipe
    const halfTotal = Math.round(water / 2);
    this.iceAmount.set(halfTotal);
    this.coldWaterAmount.set(halfTotal);
    const coldPourAmount = Math.round(halfTotal / 3);

    let coldCumulative = 0;
    const coldSteps: PourStep[] = [];
    for (let i = 1; i <= 3; i++) {
      const amt = i === 3 ? halfTotal - coldCumulative : coldPourAmount;
      coldCumulative += amt;
      coldSteps.push({
        label: `Pour ${i}`,
        amount: amt,
        cumulative: coldCumulative,
        description: `Pour ${amt}g of water in a slow circular motion.`,
      });
    }
    this.coldSteps.set(coldSteps);

    this.recipeCalculated.set(true);
  }

  startTimer(): void {
    if (this.timerRunning()) return;
    this.timerRunning.set(true);
    this.timerInterval = setInterval(() => {
      const current = this.timerSeconds();
      if (current <= 1) {
        this.timerSeconds.set(0);
        this.stopTimer();
      } else {
        this.timerSeconds.set(current - 1);
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRunning.set(false);
  }

  resetTimer(): void {
    this.stopTimer();
    this.timerSeconds.set(30);
  }

  get timerDisplay(): string {
    const s = this.timerSeconds();
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  get timerDone(): boolean {
    return this.timerSeconds() === 0 && !this.timerRunning();
  }

  resetApp(): void {
    this.brewType.set('hot');
    this.comfortLevel.set('classic');
    this.coffeeAmount.set(15);
    this.waterAmount.set(225);
    this.recipeCalculated.set(false);
    this.resetTimer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}
